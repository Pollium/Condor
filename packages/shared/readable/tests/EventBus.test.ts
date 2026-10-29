import { eventBus } from '../lib/events/EventBus';
import { logger } from '../lib/utils/Logger';
import { describe, expect, it, vi } from 'vitest';

declare global{
    interface EventMap{
        'test.handler.failed': { attempt: number };
    }
}

describe('eventBus', () => {
    it('logs a handler that throws instead of swallowing it, and still settles', async () => {
        const failure = new Error('handler broke');
        const error = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
        eventBus.on('test.handler.failed', () => {
            throw failure;
        });

        eventBus.emit('test.handler.failed', { attempt: 1 });
        await eventBus.settled();

        expect(error).toHaveBeenCalledWith('EventBus::HandlerFailed:test.handler.failed', failure);
    });
});
