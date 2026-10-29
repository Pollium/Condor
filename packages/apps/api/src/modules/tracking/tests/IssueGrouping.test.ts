import IngestBatchQueue from '../queues/IngestBatchQueue';
import Event from '../models/Event';
import Issue from '@/modules/issues/models/Issue';
import { useApp } from '@tests/harness';
import { minutesAgo } from '@tests/Seed';
import { secondsAgo, trackingSeed } from './TrackingSeed';
import { describe, expect, it } from 'vitest';

describe('Issue grouping', () => {
    useApp();

    it('groups occurrences whose messages differ only by numbers, ids, urls, quoted values and line numbers', async () => {
        const project = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        const first = trackingSeed.error(secondsAgo(90), {
            message: "Order 1042 failed for 'Camila' at https://tiendaandes.cl/api/orders/1042 (8f14e45f-ceea-467f-a0e6-6e0b1c2d9a10)",
            stack: 'Error: Order failed\n    at submit (https://tiendaandes.cl/assets/checkout.js:88:21)'
        });
        const second = trackingSeed.error(secondsAgo(30), {
            message: "Order 77 failed for 'Diego' at https://tiendaandes.cl/api/orders/77 (0c9d1f02-1111-4bbb-8ccc-222233334444)",
            stack: 'Error: Order failed\n    at submit (https://tiendaandes.cl/assets/checkout.js:91:5)'
        });
        const other = trackingSeed.error(secondsAgo(20), { errorType: 'RangeError', message: 'Invalid time value' });

        await queue.process(trackingSeed.batch(project, [first], { context: trackingSeed.context({ release: '2.4.0' }) }));
        await queue.process(trackingSeed.batch(project, [second, other], { context: trackingSeed.context({ release: '2.5.0' }) }));

        const issues = await Issue.find({ where: { projectId: project.id }, order: { errorType: 'ASC' } });
        expect(issues.map((issue) => [issue.errorType, issue.occurrences])).toEqual([['RangeError', 1], ['TypeError', 2]]);
        const grouped = issues[1];
        expect(grouped).toMatchObject({ status: 'open', firstRelease: '2.4.0', lastRelease: '2.5.0', message: first.message });
        expect(grouped.firstSeenAt.getTime()).toBe(first.timestamp);
        expect(grouped.lastSeenAt.getTime()).toBe(second.timestamp);
        expect(await Event.findBy({ projectId: project.id, type: 'error', name: grouped.id })).toHaveLength(2);
    });

    it('groups the same error across deploys and dev reloads', async () => {
        const project = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        const stackOf = (file: string) => `TypeError: x\n    at applyCoupon (https://tiendaandes.cl/${file}:87:26)`;
        const builds = ['assets/index-CsUGXkau.js', 'assets/index-B7qP0x2L.js', 'src/main.ts?t=1793263556946', 'src/main.ts'];
        const errors = builds.map((file, index) => trackingSeed.error(secondsAgo(60 - index), { stack: stackOf(file) }));

        await queue.process(trackingSeed.batch(project, errors));

        const issues = await Issue.findBy({ projectId: project.id });
        expect(issues.map((issue) => issue.occurrences).sort()).toEqual([2, 2]);
    });

    it('splits errors thrown from different top frames', async () => {
        const project = await trackingSeed.project();

        await new IngestBatchQueue().process(trackingSeed.batch(project, [
            trackingSeed.error(secondsAgo(20)),
            trackingSeed.error(secondsAgo(10), { stack: 'TypeError: x\n    at subtotal (https://tiendaandes.cl/assets/summary.js:3:9)' })
        ]));

        expect(await Issue.countBy({ projectId: project.id })).toBe(2);
    });

    it('reopens a resolved issue that occurs again, but not for an occurrence from before the fix', async () => {
        const project = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        await queue.process(trackingSeed.batch(project, [trackingSeed.error(secondsAgo(60 * 60))]));
        await Issue.update({ projectId: project.id }, { status: 'resolved', resolvedAt: minutesAgo(10) });

        await queue.process(trackingSeed.batch(project, [trackingSeed.error(secondsAgo(30 * 60))]));
        expect(await Issue.findOneByOrFail({ projectId: project.id })).toMatchObject({ status: 'resolved', regressedAt: null, occurrences: 2 });

        const comeback = trackingSeed.error(secondsAgo(60));
        await queue.process(trackingSeed.batch(project, [comeback]));
        const regressed = await Issue.findOneByOrFail({ projectId: project.id });
        expect(regressed.status).toBe('open');
        expect(regressed.regressedAt?.getTime()).toBe(comeback.timestamp);
    });

    it('keeps an ignored issue ignored while still counting it', async () => {
        const project = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        await queue.process(trackingSeed.batch(project, [trackingSeed.error(secondsAgo(60))]));
        await Issue.update({ projectId: project.id }, { status: 'ignored' });

        await queue.process(trackingSeed.batch(project, [trackingSeed.error(secondsAgo(10))]));

        expect(await Issue.findOneByOrFail({ projectId: project.id })).toMatchObject({ status: 'ignored', occurrences: 2 });
    });

    it('does not count a retried error batch twice', async () => {
        const project = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        const batch = trackingSeed.batch(project, [trackingSeed.error(secondsAgo(10))]);

        await queue.process(batch);
        await queue.process(batch);

        expect(await Issue.findOneByOrFail({ projectId: project.id })).toMatchObject({ occurrences: 1 });
    });
});
