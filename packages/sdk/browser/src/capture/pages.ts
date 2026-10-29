import Activity from './activity';
import { currentPath, utmOf } from '../location';
import { Emit } from '../types';

const ACTIVE_WINDOW_MS = 30_000;
const UTURN_MS = 7_000;
const SETTLE_MS = 150;

interface Visit{
    path: string;
    title: string;
    enteredAt: number;
    leftAt: number | null;
}

export default class PageTracker{
    #visits: Visit[] = [];
    #activeMs = 0;
    #lastInteraction = Date.now();
    #maxScroll = 0;
    #ticker: ReturnType<typeof setInterval> | null = null;
    #loaded = false;
    #settling: ReturnType<typeof setTimeout> | null = null;
    #restore: Array<() => void> = [];

    constructor(
        private readonly emit: Emit,
        private readonly activity: Activity,
        private readonly onInteraction: () => void
    ){}

    start(){
        this.#patchHistory();
        this.#listen(window, 'popstate', () => this.#changed());
        this.#listen(window, 'hashchange', () => this.#changed());
        this.#listen(window, 'scroll', () => this.#measureScroll(), { passive: true });
        for(const type of ['pointerdown', 'keydown', 'scroll', 'touchstart']){
            this.#listen(window, type, () => this.#interacted(), { passive: true, capture: true });
        }
        this.#ticker = setInterval(() => this.#tick(), 1_000);
        this.#enter(true);
    }

    stop(){
        for(const restore of this.#restore) restore();
        this.#restore = [];
        if(this.#ticker !== null) clearInterval(this.#ticker);
        if(this.#settling !== null) clearTimeout(this.#settling);
    }

    page(){
        this.#leave();
        this.#enter(false);
    }

    leave(){
        this.#leave();
    }

    resume(){
        this.#enter(false);
    }

    get current(): string | null{
        return this.#visits.at(-1)?.path ?? null;
    }

    #changed(){
        if(currentPath() === this.current && this.#settling === null) return;
        this.activity.navigation();
        this.#leave();
        if(this.#settling !== null) clearTimeout(this.#settling);
        this.#settling = setTimeout(() => {
            this.#settling = null;
            const last = this.#visits.at(-1);
            if(last === undefined || last.leftAt !== null || currentPath() !== last.path) this.#enter(false);
        }, SETTLE_MS);
    }

    #enter(initial: boolean){
        const path = currentPath();
        const now = Date.now();
        const uturn = this.#isUturn(path, now);
        this.#visits.push({ path, title: document.title, enteredAt: now, leftAt: null });
        this.#visits = this.#visits.slice(-3);
        this.#activeMs = 0;
        this.#maxScroll = 0;
        this.#measureScroll();

        const first = initial && !this.#loaded;
        this.#loaded = true;
        this.emit({
            type: 'pageview',
            ...(first && document.referrer ? { referrer: document.referrer.slice(0, 2048) } : {}),
            ...(first ? this.#utm() : {}),
            ...(uturn ? { uturn: true } : {})
        }, { path, title: document.title });
    }

    #leave(){
        const visit = this.#visits.at(-1);
        if(visit === undefined || visit.leftAt !== null) return;
        const now = Date.now();
        visit.leftAt = now;
        this.emit({
            type: 'pageleave',
            durationMs: now - visit.enteredAt,
            activeMs: this.#activeMs,
            scrollDepth: Math.round(this.#maxScroll * 1000) / 1000,
            documentHeight: document.documentElement.scrollHeight
        }, { path: visit.path, title: visit.title });
    }

    #isUturn(path: string, now: number): boolean{
        const [beforePrevious, previous] = this.#visits.slice(-2);
        if(beforePrevious === undefined || previous === undefined) return false;
        return beforePrevious.path === path && (previous.leftAt ?? now) - previous.enteredAt < UTURN_MS;
    }

    #utm(){
        const utm = utmOf(window.location.search);
        return utm === undefined ? {} : { utm };
    }

    #measureScroll(){
        const height = document.documentElement.scrollHeight;
        if(height <= 0) return;
        const depth = Math.min(1, (window.scrollY + window.innerHeight) / height);
        if(depth > this.#maxScroll) this.#maxScroll = depth;
    }

    #interacted(){
        this.#lastInteraction = Date.now();
        this.onInteraction();
    }

    #tick(){
        if(document.visibilityState === 'visible' && Date.now() - this.#lastInteraction < ACTIVE_WINDOW_MS){
            this.#activeMs += 1_000;
        }
    }

    #patchHistory(){
        for(const method of ['pushState', 'replaceState'] as const){
            const original = history[method];
            const changed = () => this.#changed();
            history[method] = function(this: History, ...args: Parameters<History['pushState']>){
                const result = original.apply(this, args);
                changed();
                return result;
            };
            this.#restore.push(() => {
                history[method] = original;
            });
        }
    }

    #listen(target: EventTarget, type: string, handler: () => void, options?: AddEventListenerOptions){
        target.addEventListener(type, handler, options);
        this.#restore.push(() => target.removeEventListener(type, handler, options));
    }
}
