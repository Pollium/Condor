import { eventRoutes } from '@condor/contracts/events/routes';
import { useApp } from '@tests/harness';
import { expectError, request } from '@tests/request';
import { actor } from '@tests/roles';
import { minutesAgo, seed } from '@tests/Seed';
import Project from '@/modules/projects/models/Project';
import Person from '@/modules/sessions/models/Person';
import { describe, expect, it } from 'vitest';

const DAY_MINUTES = 1440;

const generated = async (project: Project, person: Person, minutes: number, props: Record<string, string>) => {
    const session = await seed.session(project, person, { startedAt: minutesAgo(minutes) });
    await seed.event(session, { type: 'custom', name: 'course_generated', timestamp: minutesAgo(minutes), props });
};

const seedCourses = async (project: Project) => {
    const pro = await seed.person(project, { traits: { plan: 'pro' } });
    const free = await seed.person(project, { traits: { plan: 'free', organization: 'Pollium Global' } });
    await generated(project, pro, 60, { language: 'es', source: 'pdf' });
    await generated(project, pro, 50, { language: 'es', source: 'topic' });
    await generated(project, free, 40, { language: 'en', source: 'topic' });
    await generated(project, free, 9 * DAY_MINUTES, { language: 'en', source: 'topic' });
    const session = await seed.session(project, free, { startedAt: minutesAgo(30) });
    await seed.event(session, { type: 'custom', name: 'lesson_completed', timestamp: minutesAgo(30), props: null });
    await seed.event(session, { type: 'pageview', path: '/home', timestamp: minutesAgo(30) });
};

describe('EventController', () => {
    const ctx = useApp();

    it('lists custom events with this and the previous period, busiest first', async () => {
        const project = await seed.project();
        await seedCourses(project);
        await seedCourses(await seed.project());

        const res = await request(ctx.app, eventRoutes.list, { as: await actor('viewer'), params: { projectId: project.id }, query: { period: '7d' } });

        expect(res.data().map(({ name, count, previousCount, people }) => ({ name, count, previousCount, people }))).toEqual([
            { name: 'course_generated', count: 3, previousCount: 1, people: 2 },
            { name: 'lesson_completed', count: 1, previousCount: 0, people: 1 }
        ]);
    });

    it('draws an event over the period and lists the properties it carries', async () => {
        const project = await seed.project();
        await seedCourses(project);

        const res = await request(ctx.app, eventRoutes.detail, { as: await actor('viewer'), params: { projectId: project.id, name: 'course_generated' }, query: { period: '7d' } });
        const detail = res.data();

        expect(detail).toMatchObject({ name: 'course_generated', count: 3, previousCount: 1, people: 2 });
        expect(detail.series).toHaveLength(7);
        expect(detail.series.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(3);
        expect(detail.properties).toEqual([{ key: 'language', count: 3 }, { key: 'source', count: 3 }]);
    });

    it('breaks a property down into its values', async () => {
        const project = await seed.project();
        await seedCourses(project);

        const res = await request(ctx.app, eventRoutes.property, {
            as: await actor('viewer'),
            params: { projectId: project.id, name: 'course_generated', key: 'source' },
            query: { period: '7d' }
        });

        expect(res.data()).toEqual({
            key: 'source',
            total: 3,
            values: [{ value: 'topic', count: 2, people: 2 }, { value: 'pdf', count: 1, people: 1 }]
        });
    });

    it('narrows every view to the people in a segment', async () => {
        const project = await seed.project();
        await seedCourses(project);
        const as = await actor('viewer');
        const query = { period: '7d', traitKey: 'plan', traitValue: 'pro' };

        const list = await request(ctx.app, eventRoutes.list, { as, params: { projectId: project.id }, query });
        const property = await request(ctx.app, eventRoutes.property, { as, params: { projectId: project.id, name: 'course_generated', key: 'language' }, query });

        expect(list.data().map(({ name, count }) => ({ name, count }))).toEqual([{ name: 'course_generated', count: 2 }]);
        expect(property.data().values).toEqual([{ value: 'es', count: 2, people: 1 }]);
    });

    it('catalogs the traits people carry, without name and email', async () => {
        const project = await seed.project();
        await seedCourses(project);
        await seed.person(project, { traits: { plan: 'free', name: 'Ana', email: 'ana@correo.cl', seats: 3, admin: true } });

        const res = await request(ctx.app, eventRoutes.traits, { as: await actor('viewer'), params: { projectId: project.id } });

        expect(res.data()).toEqual([
            { key: 'plan', people: 3, values: [{ value: 'free', people: 2 }, { value: 'pro', people: 1 }] },
            { key: 'admin', people: 1, values: [{ value: 'true', people: 1 }] },
            { key: 'organization', people: 1, values: [{ value: 'Pollium Global', people: 1 }] },
            { key: 'seats', people: 1, values: [{ value: '3', people: 1 }] }
        ]);
    });

    it('refuses half a segment', async () => {
        const project = await seed.project();

        expectError(await request(ctx.app, eventRoutes.list, { as: await actor('viewer'), params: { projectId: project.id }, query: { traitKey: 'plan' } }), 400, 'Request::ValidationFailed');
    });
});
