import Activity from '../src/capture/activity';
import ClickTracker from '../src/capture/clicks';
import { EventDraft } from '../src/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const click = (target: Element, x = 100, y = 100) =>
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));

describe('ClickTracker', () => {
    let emitted: EventDraft[];
    let tracker: ClickTracker;
    let activity: Activity;

    beforeEach(() => {
        vi.useFakeTimers();
        emitted = [];
        activity = new Activity();
        tracker = new ClickTracker((draft) => emitted.push(draft), activity);
        tracker.start();
    });

    afterEach(() => {
        tracker.stop();
        vi.useRealTimers();
    });

    it('records interactive clicks right away with selector and text', () => {
        document.body.innerHTML = '<button id="pay">Pagar</button>';
        click(document.getElementById('pay')!);
        expect(emitted).toMatchObject([{ type: 'click', selector: '#pay', text: 'Pagar', rage: false, dead: false }]);
    });

    it('attributes a click inside a link or button to that control', () => {
        document.body.innerHTML = '<a class="card" href="/productos/termo"><span class="swatch"></span><strong>Termo</strong></a>';
        click(document.querySelector('.swatch')!);
        expect(emitted).toMatchObject([{ type: 'click', selector: 'body > a.card', text: 'Termo', dead: false }]);
    });

    it('flags the third quick click on the same spot as rage, once per burst', () => {
        document.body.innerHTML = '<button id="pay">Pagar</button>';
        const button = document.getElementById('pay')!;
        for(let i = 0; i < 5; i += 1){
            click(button, 100 + i, 100);
            vi.advanceTimersByTime(150);
        }
        expect(emitted.map((draft) => draft.type === 'click' && draft.rage)).toEqual([false, false, true, false, false]);

        vi.advanceTimersByTime(1_000);
        click(button);
        click(button);
        click(button);
        expect(emitted.filter((draft) => draft.type === 'click' && draft.rage)).toHaveLength(2);
    });

    it('does not count clicks far apart as rage', () => {
        document.body.innerHTML = '<button id="pay">Pagar</button>';
        const button = document.getElementById('pay')!;
        click(button, 10, 10);
        click(button, 200, 10);
        click(button, 400, 10);
        expect(emitted.some((draft) => draft.type === 'click' && draft.rage)).toBe(false);
    });

    it('marks a click on plain text that changes nothing as dead', () => {
        document.body.innerHTML = '<span id="more">Ver más</span>';
        click(document.getElementById('more')!);
        expect(emitted).toHaveLength(0);
        vi.advanceTimersByTime(1_000);
        expect(emitted).toMatchObject([{ type: 'click', text: 'Ver más', dead: true }]);
    });

    it('does not mark it dead when the page reacts', () => {
        document.body.innerHTML = '<span id="more">Ver más</span>';
        click(document.getElementById('more')!);
        vi.advanceTimersByTime(300);
        activity.navigation();
        vi.advanceTimersByTime(700);
        expect(emitted).toMatchObject([{ type: 'click', dead: false }]);
    });
});

describe('Activity', () => {
    it('ignores requests to the Condor host', () => {
        const activity = new Activity();
        activity.ignore('https://condor.test');
        const before = Date.now() - 1;
        expect(activity.since(before)).toBe(false);
        activity.request();
        expect(activity.since(before)).toBe(true);
    });
});
