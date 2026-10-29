import RetentionQueue from '../queues/RetentionQueue';
import Event from '../models/Event';
import Person from '@/modules/sessions/models/Person';
import ReplayChunk from '@/modules/sessions/models/ReplayChunk';
import Session from '@/modules/sessions/models/Session';
import { objectStorage } from '@readable/storage/ObjectStorage';
import { useApp } from '@tests/harness';
import { DEFAULT_SETTINGS, minutesAgo } from '@tests/Seed';
import { trackingSeed } from './TrackingSeed';
import { describe, expect, it, vi } from 'vitest';

const DAY_MINUTES = 24 * 60;

const daysAgo = (days: number): Date => minutesAgo(days * DAY_MINUTES);

describe('RetentionQueue', () => {
    useApp();

    it('deletes what is older than each project keeps, with its replay objects, and nothing newer', async () => {
        const remove = vi.spyOn(objectStorage, 'delete').mockResolvedValue();
        const project = await trackingSeed.project({ settings: { ...DEFAULT_SETTINGS, retentionDays: 30 } });
        const lasting = await trackingSeed.project({ settings: { ...DEFAULT_SETTINGS, retentionDays: 365 } });

        const gone = await trackingSeed.person(project, { firstSeenAt: daysAgo(40), lastSeenAt: daysAgo(40) });
        const expired = await trackingSeed.session(project, gone, { startedAt: daysAgo(40) });
        await trackingSeed.event(expired);
        const staleChunk = await ReplayChunk.create({
            projectId: project.id,
            sessionId: expired.id,
            seq: 0,
            storageKey: `replays/${project.id}/${expired.id}/000000.json.gz`,
            size: 100,
            eventCount: 3,
            firstAt: daysAgo(40),
            lastAt: daysAgo(40)
        }).save();

        const returning = await trackingSeed.person(project, { firstSeenAt: daysAgo(40), lastSeenAt: daysAgo(1) });
        await trackingSeed.session(project, returning, { startedAt: daysAgo(40) });
        const recent = await trackingSeed.session(project, returning, { startedAt: daysAgo(1) });
        await trackingSeed.event(recent);

        const kept = await trackingSeed.person(lasting, { firstSeenAt: daysAgo(40), lastSeenAt: daysAgo(40) });
        await trackingSeed.event(await trackingSeed.session(lasting, kept, { startedAt: daysAgo(40) }));

        await new RetentionQueue().process();

        expect(remove).toHaveBeenCalledWith(staleChunk.storageKey);
        expect(await ReplayChunk.count()).toBe(0);
        expect((await Session.findBy({ projectId: project.id })).map((session) => session.id)).toEqual([recent.id]);
        expect(await Event.countBy({ projectId: project.id })).toBe(1);
        expect((await Person.findBy({ projectId: project.id })).map((person) => person.id)).toEqual([returning.id]);
        expect(await Session.countBy({ projectId: lasting.id })).toBe(1);
        expect(await Event.countBy({ projectId: lasting.id })).toBe(1);
        expect(await Person.countBy({ projectId: lasting.id })).toBe(1);
    });
});
