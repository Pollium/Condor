import IngestBatchQueue from '../queues/IngestBatchQueue';
import IngestReplayQueue from '../queues/IngestReplayQueue';
import ReplayChunk from '@/modules/sessions/models/ReplayChunk';
import Session from '@/modules/sessions/models/Session';
import { useApp } from '@tests/harness';
import { secondsAgo, trackingSeed } from './TrackingSeed';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

describe('IngestReplayQueue', () => {
    useApp();

    it('indexes chunks of a known session once each and totals their bytes', async () => {
        const project = await trackingSeed.project();
        const batch = trackingSeed.batch(project, [trackingSeed.pageview('/', secondsAgo(30))]);
        await new IngestBatchQueue().process(batch);
        const queue = new IngestReplayQueue();
        const first = trackingSeed.replay(project, batch.sessionId, 0, { size: 1500 });

        await queue.process(first);
        await queue.process(first);
        await queue.process(trackingSeed.replay(project, batch.sessionId, 1, { size: 700 }));

        expect(await Session.findOneByOrFail({ id: batch.sessionId })).toMatchObject({ hasReplay: true, replayBytes: 2200 });
        expect(await ReplayChunk.findOneByOrFail({ sessionId: batch.sessionId, seq: 0 })).toMatchObject({
            storageKey: first.storageKey,
            hasFullSnapshot: true,
            eventCount: first.eventCount
        });
        expect(await ReplayChunk.countBy({ sessionId: batch.sessionId })).toBe(2);
    });

    it('attaches chunks that arrived before their session once the session opens', async () => {
        const project = await trackingSeed.project();
        const batch = trackingSeed.batch(project, [trackingSeed.pageview('/', secondsAgo(30))]);
        const queue = new IngestReplayQueue();

        await queue.process(trackingSeed.replay(project, batch.sessionId, 0, { size: 900 }));
        await queue.process(trackingSeed.replay(project, batch.sessionId, 1, { size: 100 }));
        expect(await Session.countBy({ id: batch.sessionId })).toBe(0);

        await new IngestBatchQueue().process(batch);

        expect(await Session.findOneByOrFail({ id: batch.sessionId })).toMatchObject({ hasReplay: true, replayBytes: 1000 });
    });

    it('ignores chunks of a project that no longer exists', async () => {
        const project = await trackingSeed.project();
        const job = trackingSeed.replay(project, randomUUID(), 0);
        await project.remove();

        await new IngestReplayQueue().process(job);

        expect(await ReplayChunk.count()).toBe(0);
    });
});
