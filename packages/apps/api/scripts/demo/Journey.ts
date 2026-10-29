import Random from './Random';
import { ACTIVE_SHARE, BUGS, CLICK_TARGETS, DEVICE_SLOWDOWN, DWELL_SECONDS, FASTER_RELEASE_SPEEDUP, FASTER_RELEASES, FCP_SHARE_OF_LCP, FLOW, LANDINGS, LAYOUT_SHIFT_CHANCE, LAYOUT_SHIFT_RANGE, PAGE_HEIGHTS, PAGE_PATHS, PAGE_TITLES, PRODUCTS, SCROLL_FLOOR, VITAL_RANGES, VITAL_THRESHOLDS } from './store';
import { DemoPage, PageKind, Visit, WalkState } from './types';
import { IngestEvent } from '@/modules/tracking/contracts/domain/queue';
import { VitalName, VitalRating } from '@condor/contracts/shared/analytics';

const MAX_PAGES = 14;
const UTURN_CHANCE = 0.06;
const PURCHASE_CHANCE = 0.45;
const GAP_MS: [number, number] = [300, 1800];
const UTURN_DWELL_MS: [number, number] = [2000, 5000];
const MS_PER_SECOND = 1000;
const MAX_CLICKS = 3;
const X_JITTER = 0.06;
const Y_JITTER = 60;
const ORDER_ID_LENGTH = 8;
const PERCENT = 100;
const VITAL_NAMES: VitalName[] = ['TTFB', 'FCP', 'LCP', 'CLS', 'INP'];
const CLS_PRECISION = 1000;

type EventDraft = IngestEvent extends infer E ? E extends IngestEvent ? Omit<E, 'id' | 'path' | 'rawPath' | 'title'> : never : never;

export default class Journey{
    #random: Random;

    constructor(random: Random){
        this.#random = random;
    }

    walk(visit: Visit): IngestEvent[]{
        const state: WalkState = {
            visit,
            events: [],
            at: visit.startedAt,
            cart: [],
            previous: null,
            uturn: false,
            identified: false
        };

        let page: DemoPage | null = this.#page(this.#random.weighted(LANDINGS[visit.attribution.channel]));
        for(let step = 0; step < MAX_PAGES && page !== null; step++){
            page = this.#view(state, page, step);
        }

        return state.events;
    }

    #view(state: WalkState, page: DemoPage, step: number): DemoPage | null{
        const next = this.#next(state, page);
        const uturn = page.kind === 'product' && state.previous !== null && this.#random.chance(UTURN_CHANCE);
        const dwell = uturn ? this.#random.int(...UTURN_DWELL_MS) : this.#random.int(...DWELL_SECONDS[page.kind]) * MS_PER_SECOND;

        this.#emit(state, page, {
            type: 'pageview',
            timestamp: state.at,
            ...(state.uturn ? { uturn: true } : {}),
            ...(step === 0 ? { attribution: state.visit.attribution } : {})
        });
        if(step === 0) this.#vitals(state, page);
        this.#interact(state, page, dwell, next);
        state.at += dwell;
        this.#leave(state, page, dwell);
        state.at += this.#random.int(...GAP_MS);

        state.uturn = uturn;
        const destination = uturn ? state.previous : next;
        state.previous = page;

        return destination;
    }

    #next(state: WalkState, page: DemoPage): DemoPage | null{
        const { identity, identifiesOn } = state.visit.visitor;
        if(identity !== null && identifiesOn === state.visit.ordinal && !state.identified && page.kind !== 'account'){
            return this.#page('account');
        }

        const kind = this.#random.weighted(FLOW[page.kind]);
        return kind === null ? null : this.#page(kind);
    }

    #interact(state: WalkState, page: DemoPage, dwell: number, next: DemoPage | null){
        const clicks = this.#random.int(0, MAX_CLICKS);
        for(let index = 0; index < clicks; index++){
            this.#click(state, page, state.at + Math.round(dwell * (index + 1) / (clicks + 2)));
        }

        const midway = state.at + Math.round(dwell / 2);
        if(page.kind === 'product' && page.product !== null){
            const props = { slug: page.product.slug, price: page.product.price };
            this.#emit(state, page, { type: 'custom', timestamp: state.at + MS_PER_SECOND, name: 'product_viewed', props });
            if(next?.kind === 'cart'){
                state.cart.push(page.product);
                this.#emit(state, page, { type: 'custom', timestamp: midway, name: 'add_to_cart', props });
            }
        }
        if(page.kind === 'checkout') this.#checkout(state, page, midway);
        if(page.kind === 'account') this.#identify(state, page, midway);
        this.#fail(state, page, midway);
    }

    #checkout(state: WalkState, page: DemoPage, at: number){
        const total = state.cart.reduce((sum, product) => sum + product.price, 0);
        this.#emit(state, page, { type: 'custom', timestamp: state.at + MS_PER_SECOND, name: 'checkout_started', props: { items: state.cart.length, total } });
        if(!this.#random.chance(PURCHASE_CHANCE)) return;

        this.#emit(state, page, {
            type: 'custom',
            timestamp: at,
            name: 'purchase_completed',
            props: { orderId: `TA-${this.#random.hex(ORDER_ID_LENGTH).toUpperCase()}`, items: state.cart.length, value: total, currency: 'CLP' }
        });
        state.cart = [];
    }

    #identify(state: WalkState, page: DemoPage, at: number){
        const { identity, identifiesOn } = state.visit.visitor;
        if(identity === null || identifiesOn !== state.visit.ordinal || state.identified) return;

        state.identified = true;
        this.#emit(state, page, { type: 'identify', timestamp: at, userId: identity.userId, traits: { name: identity.name, email: identity.email } });
    }

    #fail(state: WalkState, page: DemoPage, at: number){
        for(const bug of BUGS){
            if(bug.page !== page.kind || !bug.occurs(state.visit) || !this.#random.chance(bug.probability)) continue;

            const message = this.#random.pick(bug.messages);
            this.#emit(state, page, {
                type: 'error',
                timestamp: at,
                errorType: bug.errorType,
                message,
                stack: `${bug.errorType}: ${message}\n    ${bug.frame}`,
                source: bug.frame.slice(bug.frame.indexOf('(') + 1, -1)
            });
        }
    }

    #click(state: WalkState, page: DemoPage, at: number){
        const target = this.#random.pick(CLICK_TARGETS[page.kind]);
        const { device } = state.visit.visitor.device;
        const [x, y] = device === 'desktop' ? target.desktop : target.mobile;

        this.#emit(state, page, {
            type: 'click',
            timestamp: at,
            x: Math.min(1, Math.max(0, x + this.#random.between(-X_JITTER, X_JITTER))),
            y: Math.max(0, Math.round(y + this.#random.between(-Y_JITTER, Y_JITTER))),
            viewportWidth: state.visit.visitor.device.viewportWidth,
            documentHeight: this.#height(state, page),
            selector: target.selector,
            ...(target.text === '' ? {} : { text: target.text }),
            rage: this.#random.chance(target.rage),
            dead: this.#random.chance(target.dead)
        });
    }

    #leave(state: WalkState, page: DemoPage, dwell: number){
        this.#emit(state, page, {
            type: 'pageleave',
            timestamp: state.at,
            durationMs: dwell,
            activeMs: Math.round(dwell * this.#random.between(...ACTIVE_SHARE)),
            scrollDepth: Math.round(this.#random.between(SCROLL_FLOOR[page.kind], 1) * PERCENT) / PERCENT,
            documentHeight: this.#height(state, page)
        });
    }

    #vitals(state: WalkState, page: DemoPage){
        const release = FASTER_RELEASES.has(state.visit.release) ? FASTER_RELEASE_SPEEDUP : 1;
        const speed = DEVICE_SLOWDOWN[state.visit.visitor.device.device] * release;
        const lcp = this.#random.between(...VITAL_RANGES.LCP) * speed;
        const shifted = this.#random.chance(LAYOUT_SHIFT_CHANCE);
        const values: Record<VitalName, number> = {
            TTFB: Math.round(this.#random.between(...VITAL_RANGES.TTFB) * speed),
            FCP: Math.round(lcp * this.#random.between(...FCP_SHARE_OF_LCP)),
            LCP: Math.round(lcp),
            CLS: Math.round(this.#random.between(...(shifted ? LAYOUT_SHIFT_RANGE : VITAL_RANGES.CLS)) * CLS_PRECISION) / CLS_PRECISION,
            INP: Math.round(this.#random.between(...VITAL_RANGES.INP) * speed)
        };

        for(const name of VITAL_NAMES){
            this.#emit(state, page, { type: 'vital', timestamp: state.at + Math.round(lcp), name, value: values[name], rating: this.#rating(name, values[name]) });
        }
    }

    #rating(name: VitalName, value: number): VitalRating{
        const [good, poor] = VITAL_THRESHOLDS[name];
        if(value <= good) return 'good';

        return value <= poor ? 'needs-improvement' : 'poor';
    }

    #height(state: WalkState, page: DemoPage): number{
        const [desktop, mobile] = PAGE_HEIGHTS[page.kind];

        return state.visit.visitor.device.device === 'desktop' ? desktop : mobile;
    }

    #emit(state: WalkState, page: DemoPage, draft: EventDraft){
        state.events.push({
            ...draft,
            id: this.#random.uuid(),
            path: PAGE_PATHS[page.kind],
            rawPath: page.product === null ? PAGE_PATHS[page.kind] : `/productos/${page.product.slug}`,
            title: page.product === null ? PAGE_TITLES[page.kind] : `${page.product.name} ${PAGE_TITLES.product}`
        } as IngestEvent);
    }

    #page(kind: PageKind): DemoPage{
        return {
            kind,
            product: kind === 'product' ? this.#random.weighted(PRODUCTS) : null
        };
    }
}
