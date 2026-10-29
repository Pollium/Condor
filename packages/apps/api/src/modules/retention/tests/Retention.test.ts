import { describe, expect, it } from 'vitest';
import { retentionRoutes } from '@condor/contracts/retention/routes';
import { utcAt, utcDayStart } from '@tests/clock';
import { useApp } from '@tests/harness';
import { expectError, request } from '@tests/request';
import { actor } from '@tests/roles';
import { seed } from '@tests/Seed';
import Project from '@/modules/projects/models/Project';
import Person from '@/modules/sessions/models/Person';

const DAY_MS = 86_400_000;
const ISO_DAY = 10;

const day = (daysAgo: number): string => utcDayStart(daysAgo).toISOString().slice(0, ISO_DAY);

const visitor = async (project: Project, firstDaysAgo: number, returnDaysAgo: number[]): Promise<Person> => {
    const person = await seed.person(project, { firstSeenAt: utcAt(firstDaysAgo, 12) });
    await seed.session(project, person, { startedAt: utcAt(firstDaysAgo, 12) });
    for(const daysAgo of returnDaysAgo){
        await seed.session(project, person, { startedAt: utcDayStart(daysAgo) });
    }
    return person;
};

describe('RetentionController', () => {
    const ctx = useApp();

    it('shares each daily cohort that came back in every elapsed period, weighted on average', async () => {
        const project = await seed.project();
        await visitor(project, 2, [1, 0]);
        await visitor(project, 2, [0]);
        await visitor(project, 2, []);
        await visitor(project, 1, [0]);
        await visitor(project, 1, []);
        await visitor(project, 5, [2]);

        const res = await request(ctx.app, retentionRoutes.retention, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { grain: 'day', cohorts: 3 }
        });

        expect(res.status).toBe(200);
        const retention = res.data();
        expect(retention.grain).toBe('day');
        expect(retention.returnEvent).toBeNull();
        expect(retention.cohorts).toEqual([
            { start: day(2), size: 3, values: [1, expect.closeTo(1 / 3), expect.closeTo(2 / 3)] },
            { start: day(1), size: 2, values: [1, 0.5] },
            { start: day(0), size: 0, values: [0] }
        ]);
        expect(retention.average).toEqual([1, 0.4, expect.closeTo(2 / 3)]);
    });

    it('counts a custom return event instead of any session', async () => {
        const project = await seed.project();
        const buyer = await visitor(project, 2, [1, 0]);
        await visitor(project, 2, [0]);
        const session = await seed.session(project, buyer, { startedAt: utcAt(1, 15) });
        await seed.event(session, { type: 'custom', name: 'purchase_completed', timestamp: utcAt(1, 15) });

        const retention = (await request(ctx.app, retentionRoutes.retention, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { grain: 'day', cohorts: 3, returnEvent: 'purchase_completed' }
        })).data();

        expect(retention.returnEvent).toBe('purchase_completed');
        expect(retention.cohorts[0]).toEqual({ start: day(2), size: 2, values: [1, 0.5, 0] });
    });

    it('defaults to eight weekly cohorts starting on Monday in the project timezone', async () => {
        const project = await seed.project();

        const retention = (await request(ctx.app, retentionRoutes.retention, {
            as: await actor('viewer'),
            params: { projectId: project.id }
        })).data();

        const today = utcDayStart(0);
        const monday = new Date(today.getTime() - ((today.getUTCDay() + 6) % 7) * DAY_MS);
        expect(retention.grain).toBe('week');
        expect(retention.cohorts).toHaveLength(8);
        expect(retention.cohorts[7]?.start).toBe(monday.toISOString().slice(0, ISO_DAY));
        expect(retention.cohorts[0]?.values).toHaveLength(8);
        expect(retention.average).toHaveLength(8);
    });

    it('rejects an unknown grain', async () => {
        const project = await seed.project();

        expectError(await request(ctx.app, retentionRoutes.retention, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { grain: 'month' }
        }), 400, 'Request::ValidationFailed');
    });
});
