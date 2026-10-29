import Activity from '../src/capture/activity';
import PageTracker from '../src/capture/pages';
import { EventDraft, EventPlace } from '../src/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('PageTracker', () => {
    let emitted: Array<{ draft: EventDraft; place?: EventPlace }>;
    let tracker: PageTracker;

    beforeEach(() => {
        vi.useFakeTimers();
        history.replaceState(null, '', '/?utm_source=instagram&utm_campaign=primavera');
        emitted = [];
        tracker = new PageTracker((draft, place) => emitted.push({ draft, place }), new Activity(), () => undefined);
        tracker.start();
    });

    afterEach(() => {
        tracker.stop();
        vi.useRealTimers();
    });

    it('sends the first pageview with utm and a pageleave before each navigation', () => {
        expect(emitted[0]).toMatchObject({ draft: { type: 'pageview', utm: { source: 'instagram', campaign: 'primavera' } }, place: { path: '/' } });

        vi.advanceTimersByTime(3_000);
        history.pushState(null, '', '/productos');
        document.title = 'Productos';
        vi.advanceTimersByTime(200);

        expect(emitted.map(({ draft, place }) => `${draft.type} ${place?.path}`)).toEqual([
            'pageview /',
            'pageleave /',
            'pageview /productos'
        ]);
        expect(emitted[1].draft).toMatchObject({ type: 'pageleave', durationMs: 3_000 });
        expect(emitted[2].draft).not.toHaveProperty('utm');
        expect(emitted[2].place).toMatchObject({ path: '/productos', title: 'Productos' });
    });

    it('records only where a redirect lands', () => {
        history.pushState(null, '', '/login');
        history.replaceState(null, '', '/cuenta');
        vi.advanceTimersByTime(200);
        const views = emitted.filter(({ draft }) => draft.type === 'pageview').map(({ place }) => place?.path);
        expect(views).toEqual(['/', '/cuenta']);
    });

    it('ignores query-only changes', () => {
        history.pushState(null, '', '/?page=2');
        expect(emitted).toHaveLength(1);
    });

    it('flags a quick return to the page before as a u-turn', () => {
        history.pushState(null, '', '/productos/botas');
        vi.advanceTimersByTime(2_000);
        history.pushState(null, '', '/');
        vi.advanceTimersByTime(200);

        const views = emitted.filter(({ draft }) => draft.type === 'pageview').map(({ draft }) => draft);
        expect(views.at(-1)).toMatchObject({ uturn: true });
    });

    it('does not flag a u-turn after a long stay', () => {
        history.pushState(null, '', '/productos/botas');
        vi.advanceTimersByTime(30_000);
        history.pushState(null, '', '/');
        vi.advanceTimersByTime(200);

        const views = emitted.filter(({ draft }) => draft.type === 'pageview').map(({ draft }) => draft);
        expect(views.at(-1)).not.toHaveProperty('uturn');
    });
});
