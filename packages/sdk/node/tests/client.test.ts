import { createCondor } from '../src/index.js';
import { describe, expect, it, vi } from 'vitest';

const answering = (...statuses: number[]) => {
    const queue = [...statuses];
    return vi.fn(async () => new Response('{}', { status: queue.shift() ?? 200 }));
};

const bodies = (fetch: ReturnType<typeof answering>) =>
    fetch.mock.calls.map((call) => JSON.parse(String((call as unknown as [string, RequestInit])[1].body)));

describe('Condor', () => {
    it('sends each user\'s events as one batch on flush', async () => {
        const fetch = answering();
        const condor = createCondor({ key: 'ck_test', host: 'https://condor.example.com/', release: '2.1.0', fetch });

        condor.identify({ userId: 'user-1', traits: { plan: 'pro' }, timestamp: 1_000 });
        condor.track({ userId: 'user-1', name: 'course_generated', props: { source: 'pdf' }, timestamp: new Date(2_000) });
        condor.track({ userId: 'user-2', name: 'lesson_completed' });
        await condor.flush();

        expect(fetch).toHaveBeenCalledTimes(2);
        expect((fetch.mock.calls[0] as unknown as [string])[0]).toBe('https://condor.example.com/i/batch');
        const [first, second] = bodies(fetch);
        expect(first).toMatchObject({
            key: 'ck_test',
            sdk: { name: 'condor-node' },
            anonymousId: 'user-1',
            userId: 'user-1',
            context: { release: '2.1.0' },
            events: [
                { type: 'identify', userId: 'user-1', traits: { plan: 'pro' }, timestamp: 1_000, path: '/' },
                { type: 'custom', name: 'course_generated', props: { source: 'pdf' }, timestamp: 2_000, path: '/' }
            ]
        });
        expect(first.sessionId).toBeUndefined();
        expect(second).toMatchObject({ userId: 'user-2', events: [{ type: 'custom', name: 'lesson_completed' }] });
        await condor.shutdown();
    });

    it('flushes on its own once enough events are queued', async () => {
        const fetch = answering();
        const condor = createCondor({ key: 'ck_test', host: 'https://condor.example.com', flushAt: 2, fetch });

        condor.track({ userId: 'user-1', name: 'a' });
        expect(fetch).not.toHaveBeenCalled();
        condor.track({ userId: 'user-1', name: 'b' });
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());

        expect(bodies(fetch)[0].events).toHaveLength(2);
        await condor.shutdown();
    });

    it('retries a busy collector and gives up on a rejected key', async () => {
        const fetch = answering(503, 200, 401);
        const onError = vi.fn();
        const condor = createCondor({ key: 'ck_test', host: 'https://condor.example.com', maxRetries: 1, fetch, onError });

        condor.track({ userId: 'user-1', name: 'a' });
        await condor.flush();
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(onError).not.toHaveBeenCalled();

        condor.track({ userId: 'user-1', name: 'b' });
        await condor.flush();
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(onError).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ message: 'Condor answered 401' }));
        await condor.shutdown();
    });

    it('reports a collector it cannot reach after the last retry', async () => {
        const fetch = vi.fn(async () => {
            throw new TypeError('fetch failed');
        });
        const onError = vi.fn();
        const condor = createCondor({ key: 'ck_test', host: 'https://condor.example.com', maxRetries: 0, fetch, onError });

        condor.track({ userId: 'user-1', name: 'a' });
        await condor.flush();

        expect(onError).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ message: 'fetch failed' }));
        await condor.shutdown();
    });

    it('sends what is still queued when it shuts down', async () => {
        const fetch = answering();
        const condor = createCondor({ key: 'ck_test', host: 'https://condor.example.com', fetch });

        condor.track({ userId: 'user-1', name: 'a' });
        await condor.shutdown();

        expect(fetch).toHaveBeenCalledOnce();
    });
});
