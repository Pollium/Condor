import { describe, expect, it } from 'vitest';
import { Breakdown } from '@condor/contracts/overview/domain';
import { overviewRoutes } from '@condor/contracts/overview/routes';
import { dayLabel, isoWeekday, utcAt, utcDayStart } from '@tests/clock';
import { useApp } from '@tests/harness';
import { expectError, request } from '@tests/request';
import { actor } from '@tests/roles';
import { DEFAULT_SETTINGS, seed } from '@tests/Seed';
import Project from '@/modules/projects/models/Project';

describe('OverviewController', () => {
    const ctx = useApp();

    const breakdown = async (project: Project, dimension: string, limit?: number): Promise<Breakdown> => {
        const res = await request(ctx.app, overviewRoutes.breakdown, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: limit === undefined ? { dimension } : { dimension, limit }
        });
        expect(res.status).toBe(200);
        return res.data();
    };

    it('reports every KPI against the previous period and per day bucket', async () => {
        const project = await seed.project();
        const [first, second, previous, old] = await Promise.all([
            seed.person(project),
            seed.person(project),
            seed.person(project),
            seed.person(project)
        ]);
        await seed.session(project, first, { startedAt: utcAt(2, 10), duration: 60, pageviews: 1, sequence: 1 });
        await seed.session(project, first, { startedAt: utcAt(2, 15), duration: 180, pageviews: 3, rageClicks: 1, sequence: 2 });
        const erring = await seed.session(project, second, { startedAt: utcAt(1, 9), duration: 120, pageviews: 2, errors: 1, sequence: 1 });
        const before = await seed.session(project, previous, { startedAt: utcAt(9, 12), duration: 300, pageviews: 1, sequence: 1 });
        const outside = await seed.session(project, old, { startedAt: utcAt(20, 12) });
        await seed.event(erring, { type: 'error', name: 'issue', timestamp: utcAt(1, 9, 5) });
        await seed.event(before, { type: 'error', name: 'issue', timestamp: utcAt(9, 12, 1) });
        await seed.event(outside, { type: 'error', name: 'issue', timestamp: utcAt(20, 12, 1) });

        const res = await request(ctx.app, overviewRoutes.summary, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { period: '7d' }
        });

        expect(res.status).toBe(200);
        const summary = res.data();
        expect(summary.buckets).toHaveLength(7);
        expect(summary.buckets[4]).toBe(dayLabel(utcDayStart(2)));
        expect(summary.pageviews).toBe(6);
        const [sessions, people, duration, bounce, frustrated, errors] = summary.kpis;
        expect(sessions).toEqual({ key: 'sessions', value: 3, previous: 1, series: [0, 0, 0, 0, 2, 1, 0] });
        expect(people).toEqual({ key: 'people', value: 2, previous: 1, series: [0, 0, 0, 0, 1, 1, 0] });
        expect(duration).toEqual({ key: 'duration', value: 120, previous: 300, series: [0, 0, 0, 0, 120, 120, 0] });
        expect(bounce).toEqual({ key: 'bounce', value: expect.closeTo(1 / 3), previous: 1, series: [0, 0, 0, 0, 0.5, 0, 0] });
        expect(frustrated).toEqual({ key: 'frustrated', value: expect.closeTo(2 / 3), previous: 0, series: [0, 0, 0, 0, 0.5, 1, 0] });
        expect(errors).toEqual({ key: 'errors', value: 1, previous: 1, series: [0, 0, 0, 0, 0, 1, 0] });
        expect(summary.audience[4]).toEqual({ fresh: 1, returning: 1 });
        expect(summary.audience[5]).toEqual({ fresh: 1, returning: 0 });
    });

    it('cuts day buckets and hours in the project timezone', async () => {
        const ahead = await seed.project({ settings: { ...DEFAULT_SETTINGS, timezone: 'Etc/GMT-1' } });
        const behind = await seed.project({ settings: { ...DEFAULT_SETTINGS, timezone: 'Etc/GMT+3' } });
        const lateNight = utcAt(3, 23, 30);
        for(const project of [ahead, behind]){
            await seed.session(project, await seed.person(project), { startedAt: lateNight });
        }

        const cases = [
            { project: ahead, day: utcDayStart(2), hour: 0 },
            { project: behind, day: utcDayStart(3), hour: 20 }
        ];
        for(const { project, day, hour } of cases){
            const summary = (await request(ctx.app, overviewRoutes.summary, {
                as: await actor('viewer'),
                params: { projectId: project.id },
                query: { period: '7d' }
            })).data();
            const series = summary.kpis[0]?.series ?? [];
            expect(series[summary.buckets.indexOf(dayLabel(day))]).toBe(1);
            expect(series.reduce((sum, count) => sum + count, 0)).toBe(1);

            const hours = (await request(ctx.app, overviewRoutes.hours, {
                as: await actor('viewer'),
                params: { projectId: project.id }
            })).data();
            expect(hours).toEqual([{ weekday: isoWeekday(day), hour, sessions: 1 }]);
        }
    });

    it('breaks sessions down by column, keeping the full session count as total', async () => {
        const project = await seed.project();
        const person = await seed.person(project);
        await seed.session(project, person, { startedAt: utcAt(1, 10), country: 'CL', city: 'Santiago', release: '1.2.0', errors: 2 });
        await seed.session(project, person, { startedAt: utcAt(1, 11), country: 'CL', city: 'Valparaíso', release: '1.2.0' });
        await seed.session(project, person, { startedAt: utcAt(1, 12), country: 'AR', city: 'Santiago', release: '1.1.0', errors: 1 });
        await seed.session(project, person, { startedAt: utcAt(1, 13), country: null, city: null, release: null });

        expect(await breakdown(project, 'country')).toEqual({
            dimension: 'country',
            period: '7d',
            total: 4,
            slices: [
                { id: 'CL', label: 'CL', value: 2 },
                { id: 'AR', label: 'AR', value: 1 }
            ]
        });
        expect((await breakdown(project, 'city')).slices).toEqual([
            { id: 'AR:Santiago', label: 'Santiago', detail: 'AR', value: 1 },
            { id: 'CL:Santiago', label: 'Santiago', detail: 'CL', value: 1 },
            { id: 'CL:Valparaíso', label: 'Valparaíso', detail: 'CL', value: 1 }
        ]);
        expect((await breakdown(project, 'release')).slices).toEqual([
            { id: '1.2.0', label: '1.2.0', value: 2, secondary: 1 },
            { id: '1.1.0', label: '1.1.0', value: 1, secondary: 1 }
        ]);
        expect((await breakdown(project, 'country', 1)).slices).toEqual([{ id: 'CL', label: 'CL', value: 2 }]);
    });

    it('keeps bucketed dimensions in their natural order, empty buckets included', async () => {
        const project = await seed.project();
        const [loyal, once] = await Promise.all([seed.person(project), seed.person(project)]);
        await seed.session(project, loyal, { startedAt: utcAt(1, 8), duration: 5, pageviews: 1 });
        await seed.session(project, loyal, { startedAt: utcAt(1, 9), duration: 45, pageviews: 5 });
        await seed.session(project, loyal, { startedAt: utcAt(1, 10), duration: 45, pageviews: 12 });
        await seed.session(project, once, { startedAt: utcAt(1, 11), duration: 4000, pageviews: 2, rageClicks: 2, uturns: 1 });

        const duration = await breakdown(project, 'duration');
        expect(duration.total).toBe(4);
        expect(duration.slices.map((slice) => [slice.id, slice.value])).toEqual([
            ['<10s', 1], ['10-30s', 0], ['30s-1m', 2], ['1-3m', 0], ['3-10m', 0], ['10-30m', 0], ['>30m', 1]
        ]);
        const depth = await breakdown(project, 'depth');
        expect(depth.slices.map((slice) => slice.value)).toEqual([1, 1, 0, 1, 0, 1]);
        const frequency = await breakdown(project, 'frequency');
        expect(frequency.total).toBe(2);
        expect(frequency.slices.map((slice) => [slice.id, slice.value])).toEqual([['1', 1], ['2-3', 1], ['4-9', 0], ['10+', 0]]);
        const frustration = await breakdown(project, 'frustration');
        expect(frustration.total).toBe(4);
        expect(frustration.slices.slice(0, 2)).toEqual([
            { id: 'rage', label: 'rage', value: 1 },
            { id: 'uturn', label: 'uturn', value: 1 }
        ]);
    });

    it('breaks down pages, entries and custom events from the event stream', async () => {
        const project = await seed.project();
        const [buyer, browser] = await Promise.all([seed.person(project), seed.person(project)]);
        const first = await seed.session(project, buyer, { startedAt: utcAt(1, 10), entryPath: '/productos/:slug' });
        const second = await seed.session(project, buyer, { startedAt: utcAt(1, 11), entryPath: '/productos/:slug' });
        const third = await seed.session(project, browser, { startedAt: utcAt(1, 12), entryPath: '/' });
        await seed.event(first, { path: '/productos/:slug', title: 'Zapatillas', timestamp: utcAt(1, 10) });
        await seed.event(second, { path: '/productos/:slug', title: 'Chaqueta', timestamp: utcAt(1, 11) });
        await seed.event(second, { path: '/productos/:slug', title: null, timestamp: utcAt(1, 11, 5) });
        await seed.event(third, { path: '/', title: 'Inicio', timestamp: utcAt(1, 12) });
        await seed.event(first, { type: 'custom', name: 'add_to_cart', timestamp: utcAt(1, 10, 1) });
        await seed.event(second, { type: 'custom', name: 'add_to_cart', timestamp: utcAt(1, 11, 1) });
        await seed.event(third, { type: 'custom', name: 'add_to_cart', timestamp: utcAt(1, 12, 1) });
        await seed.event(third, { type: 'custom', name: 'signup', timestamp: utcAt(1, 12, 2) });

        expect(await breakdown(project, 'page')).toMatchObject({
            total: 4,
            slices: [
                { id: '/productos/:slug', value: 3, detail: 'Chaqueta' },
                { id: '/', value: 1, detail: 'Inicio' }
            ]
        });
        expect((await breakdown(project, 'entry')).slices).toEqual([
            { id: '/productos/:slug', label: '/productos/:slug', value: 2, secondary: 3 },
            { id: '/', label: '/', value: 1, secondary: 1 }
        ]);
        expect(await breakdown(project, 'event')).toMatchObject({
            total: 4,
            slices: [
                { id: 'add_to_cart', value: 3, secondary: 2 },
                { id: 'signup', value: 1, secondary: 1 }
            ]
        });
    });

    it('rejects an unknown or missing dimension', async () => {
        const project = await seed.project();

        const invalid = await request(ctx.app, overviewRoutes.breakdown, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { dimension: 'planet' }
        });
        expectError(invalid, 400, 'Request::ValidationFailed');
        expect(invalid.json()).toMatchObject({ errors: { dimension: 'Invalid dimension' } });
        expectError(await request(ctx.app, overviewRoutes.breakdown, {
            as: await actor('viewer'),
            params: { projectId: project.id }
        }), 400, 'Request::ValidationFailed');
    });

    it('averages engagement over the sessions of the period', async () => {
        const project = await seed.project();
        const [regular, visitor] = await Promise.all([seed.person(project), seed.person(project)]);
        await seed.session(project, regular, { startedAt: utcAt(1, 8), duration: 100, activeDuration: 50, scrollDepth: 0.5, clicks: 4, rageClicks: 1 });
        await seed.session(project, regular, { startedAt: utcAt(1, 9), duration: 300, activeDuration: 250, scrollDepth: 1, clicks: 6 });
        await seed.session(project, visitor, { startedAt: utcAt(1, 10), duration: 200, activeDuration: 100, scrollDepth: 0.75, clicks: 0 });
        await seed.session(project, visitor, { startedAt: utcAt(30, 10), duration: 9000, activeDuration: 9000, clicks: 90 });

        const res = await request(ctx.app, overviewRoutes.engagement, { as: await actor('viewer'), params: { projectId: project.id } });

        expect(res.status).toBe(200);
        const engagement = res.data();
        expect(engagement.activeSeconds).toBeCloseTo(400 / 3);
        expect(engagement.activeShare).toBeCloseTo(400 / 600);
        expect(engagement.scrollDepth).toBeCloseTo(0.75);
        expect(engagement.clicksPerSession).toBeCloseTo(10 / 3);
        expect(engagement.ragePer100).toBeCloseTo(10);
        expect(engagement.sessionsPerPerson).toBeCloseTo(1.5);
    });

    it('reports p75, the good share and the rating per vital', async () => {
        const project = await seed.project();
        const session = await seed.session(project, await seed.person(project), { startedAt: utcAt(1, 10) });
        for(const value of [1000, 2000, 3000, 5000]){
            await seed.event(session, { type: 'vital', name: 'LCP', value, timestamp: utcAt(1, 10, 1) });
        }
        await seed.event(session, { type: 'vital', name: 'CLS', value: 0.05, timestamp: utcAt(1, 10, 1) });
        await seed.event(session, { type: 'vital', name: 'CLS', value: 0.3, timestamp: utcAt(1, 10, 2) });
        await seed.event(session, { type: 'vital', name: 'INP', value: 900, timestamp: utcAt(30, 10) });

        const res = await request(ctx.app, overviewRoutes.vitals, { as: await actor('viewer'), params: { projectId: project.id } });

        expect(res.data()).toEqual([
            { name: 'LCP', p75: 3500, good: 0.5, rating: 'needs-improvement', samples: 4 },
            { name: 'CLS', p75: expect.closeTo(0.2375), good: 0.5, rating: 'needs-improvement', samples: 2 }
        ]);
    });

    it('guards the overview behind membership and an existing project', async () => {
        const project = await seed.project();

        expectError(await request(ctx.app, overviewRoutes.summary, { params: { projectId: project.id } }), 401, 'Auth::Unauthorized');
        expectError(await request(ctx.app, overviewRoutes.summary, {
            as: await actor('viewer'),
            params: { projectId: '00000000-0000-4000-8000-000000000000' }
        }), 404, 'Project::NotFound');
        expectError(await request(ctx.app, overviewRoutes.summary, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { period: '1y' }
        }), 400, 'Request::ValidationFailed');
    });
});
