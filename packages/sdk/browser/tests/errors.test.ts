import ErrorTracker from '../src/capture/errors';
import { EventDraft } from '../src/types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('ErrorTracker', () => {
    let emitted: EventDraft[];
    let tracker: ErrorTracker;

    beforeEach(() => {
        emitted = [];
        tracker = new ErrorTracker((draft) => emitted.push(draft));
        tracker.start();
    });

    afterEach(() => tracker.stop());

    it('reports uncaught errors with type, message and stack once per page', () => {
        const error = new TypeError("Cannot read properties of undefined (reading 'discount')");
        window.dispatchEvent(new ErrorEvent('error', { error, message: error.message, filename: 'https://tienda.test/app.js', lineno: 12, colno: 4 }));
        window.dispatchEvent(new ErrorEvent('error', { error, message: error.message }));

        expect(emitted).toHaveLength(1);
        expect(emitted[0]).toMatchObject({ type: 'error', errorType: 'TypeError', message: error.message, source: 'https://tienda.test/app.js:12:4' });

        tracker.pageChanged();
        window.dispatchEvent(new ErrorEvent('error', { error, message: error.message }));
        expect(emitted).toHaveLength(2);
    });

    it('reports network failures handed to it', () => {
        tracker.report('Network', 'GET /api/stock/botas → 500');
        expect(emitted).toMatchObject([{ type: 'error', errorType: 'Network', message: 'GET /api/stock/botas → 500' }]);
    });
});
