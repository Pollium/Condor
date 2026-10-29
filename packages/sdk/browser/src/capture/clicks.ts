import Activity from './activity';
import { clickedElement, isInteractive, selectorOf, textOf } from '../selector';
import { Emit } from '../types';

const RAGE_WINDOW_MS = 700;
const RAGE_RADIUS_PX = 30;
const RAGE_COUNT = 3;
const DEAD_AFTER_MS = 1_000;

interface Recent{
    at: number;
    x: number;
    y: number;
}

export default class ClickTracker{
    #recent: Recent[] = [];
    #burstFlagged = false;
    #handler = (event: MouseEvent) => this.#clicked(event);

    constructor(private readonly emit: Emit, private readonly activity: Activity){}

    start(){
        document.addEventListener('click', this.#handler, true);
    }

    stop(){
        document.removeEventListener('click', this.#handler, true);
    }

    #clicked(event: MouseEvent){
        const origin = event.target instanceof Element ? event.target : null;
        if(origin === null) return;
        const target = clickedElement(origin);

        const at = Date.now();
        const rage = this.#isRage({ at, x: event.clientX, y: event.clientY });
        const root = document.documentElement;
        const click = {
            type: 'click' as const,
            x: Math.round((event.pageX / Math.max(1, root.scrollWidth)) * 10_000) / 10_000,
            y: Math.round(event.pageY),
            viewportWidth: window.innerWidth,
            documentHeight: root.scrollHeight,
            selector: selectorOf(target).slice(0, 1024),
            ...this.#text(target),
            rage
        };

        if(isInteractive(target) || rage){
            this.emit({ ...click, dead: false });
            return;
        }
        setTimeout(() => this.emit({ ...click, dead: !this.activity.since(at) }), DEAD_AFTER_MS);
    }

    #isRage(click: Recent): boolean{
        const previous = this.#recent.at(-1);
        if(previous === undefined || click.at - previous.at > RAGE_WINDOW_MS) this.#burstFlagged = false;

        this.#recent = [...this.#recent, click].filter((entry) =>
            click.at - entry.at <= RAGE_WINDOW_MS
            && Math.hypot(entry.x - click.x, entry.y - click.y) <= RAGE_RADIUS_PX
        );

        if(this.#burstFlagged || this.#recent.length < RAGE_COUNT) return false;
        this.#burstFlagged = true;
        return true;
    }

    #text(target: Element){
        const text = textOf(target);
        return text === undefined ? {} : { text };
    }
}
