import Identity from '../src/identity';
import EventQueue from '../src/queue';
import Transport from '../src/transport';
import { WireBatch, WireEvent } from '@condor/contracts/ingest/wire';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const event = (index: number): WireEvent => ({
    type: 'custom',
    name: `event_${index}`,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    path: '/'
});

describe('EventQueue', () => {
    let identity: Identity;
    let transport: Transport;
    let posted: WireBatch[];
    let queue: EventQueue;

    beforeEach(() => {
        vi.useFakeTimers();
        identity = new Identity();
        transport = new Transport();
        posted = [];
        vi.spyOn(transport, 'post').mockImplementation(async (_url, payload) => {
            posted.push(payload as WireBatch);
            return 'sent';
        });
        queue = new EventQueue({ key: 'ck_test', endpoint: 'https://condor.test/i/batch', release: '1.0.0' }, identity, transport, () => undefined);
        queue.start();
    });

    afterEach(() => {
        queue.stop();
        vi.useRealTimers();
    });

    it('flushes at 20 events with the batch envelope', () => {
        for(let i = 0; i < 20; i += 1) queue.push(event(i));
        expect(posted).toHaveLength(1);
        expect(posted[0]).toMatchObject({
            key: 'ck_test',
            sdk: { name: 'condor-browser' },
            anonymousId: identity.anonymousId,
            sessionId: identity.session.id,
            context: { release: '1.0.0' }
        });
        expect(posted[0].events).toHaveLength(20);
    });

    it('flushes what it has every 5 seconds', async () => {
        queue.push(event(1));
        await vi.advanceTimersByTimeAsync(5_000);
        expect(posted).toHaveLength(1);
        await vi.advanceTimersByTimeAsync(5_000);
        expect(posted).toHaveLength(1);
    });

    it('sends a beacon when the page hides', () => {
        const beacon = vi.spyOn(transport, 'beacon').mockReturnValue(true);
        queue.push(event(1));
        queue.beacon();
        expect(beacon).toHaveBeenCalledOnce();
        expect(queue.size).toBe(0);
    });

    it('never mixes two sessions in one batch', () => {
        queue.push(event(1));
        const first = identity.session.id;
        identity.reset();
        queue.push(event(2));
        expect(posted[0].sessionId).toBe(first);
        expect(posted[0].events).toHaveLength(1);
    });
});
