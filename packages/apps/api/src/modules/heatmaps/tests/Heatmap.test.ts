import { describe, expect, it } from 'vitest';
import { heatmapRoutes } from '@condor/contracts/heatmaps/routes';
import { utcAt } from '@tests/clock';
import { useApp } from '@tests/harness';
import { expectError, request } from '@tests/request';
import { actor } from '@tests/roles';
import { seed } from '@tests/Seed';
import Project from '@/modules/projects/models/Project';
import ReplayChunk from '@/modules/sessions/models/ReplayChunk';
import Session from '@/modules/sessions/models/Session';

const PRODUCT = '/productos/:slug';

const chunk = (session: Session, overrides: Partial<ReplayChunk>): Promise<ReplayChunk> =>
    Object.assign(ReplayChunk.create({
        projectId: session.projectId,
        sessionId: session.id,
        seq: 0,
        storageKey: `replays/${session.projectId}/${session.id}/000000.json.gz`,
        size: 2048,
        eventCount: 40,
        firstAt: session.startedAt,
        lastAt: session.endedAt,
        hasFullSnapshot: false
    }), overrides).save();

const seedProductPage = async (project: Project) => {
    const person = await seed.person(project);
    const first = await seed.session(project, person, { startedAt: utcAt(2, 10), viewportWidth: 1440 });
    const second = await seed.session(project, person, { startedAt: utcAt(1, 10), viewportWidth: 1280 });
    const third = await seed.session(project, person, { startedAt: utcAt(1, 12), viewportWidth: 1600 });
    const phone = await seed.session(project, person, { startedAt: utcAt(1, 14), viewportWidth: 390, device: 'mobile' });

    for(const session of [first, second, third, phone]){
        await seed.event(session, { path: PRODUCT, title: 'Zapatillas Andes' });
    }
    const click = { type: 'click' as const, path: PRODUCT, timestamp: utcAt(2, 10, 1), viewportWidth: 1440, documentHeight: 3000 };
    await seed.event(first, { ...click, x: 0.5, y: 100, selector: '#buy', text: 'Comprar' });
    await seed.event(first, { ...click, x: 0.501, y: 103, selector: '#buy', text: 'Comprar', rage: true });
    await seed.event(first, { ...click, x: 0.1, y: 500, selector: 'nav a', text: 'Inicio', dead: true });
    await seed.event(first, { ...click, path: '/', x: 0.9, y: 40, selector: '#logo' });
    await seed.event(second, { ...click, timestamp: utcAt(1, 10, 1), viewportWidth: 1280, documentHeight: 3200, x: 0.5, y: 100, selector: '#buy', text: 'Comprar ahora' });
    await seed.event(phone, { ...click, timestamp: utcAt(1, 14, 1), viewportWidth: 390, documentHeight: 6000, x: 0.5, y: 100, selector: '#buy' });

    const leave = { type: 'pageleave' as const, path: PRODUCT };
    await seed.event(first, { ...leave, timestamp: utcAt(2, 10, 2), value: 1, documentHeight: 3000 });
    await seed.event(second, { ...leave, timestamp: utcAt(1, 10, 2), value: 0.5, documentHeight: 3200 });
    await seed.event(third, { ...leave, timestamp: utcAt(1, 12, 2), value: 0.25, documentHeight: 2800 });

    await chunk(first, { hasFullSnapshot: true, firstAt: utcAt(2, 9, 59), lastAt: utcAt(2, 10, 30) });
    await chunk(second, { hasFullSnapshot: true, firstAt: utcAt(1, 10, 1), lastAt: utcAt(1, 10, 30) });
    await chunk(third, { hasFullSnapshot: false, firstAt: utcAt(1, 11, 59), lastAt: utcAt(1, 12, 30) });
    await chunk(phone, { hasFullSnapshot: true, firstAt: utcAt(1, 13, 59), lastAt: utcAt(1, 14, 30) });

    return { first, phone };
};

describe('HeatmapController', () => {
    const ctx = useApp();

    it('lists the pages with views and clicks, most clicked first', async () => {
        const project = await seed.project();
        await seedProductPage(project);

        const res = await request(ctx.app, heatmapRoutes.pages, { as: await actor('viewer'), params: { projectId: project.id } });

        expect(res.status).toBe(200);
        expect(res.data()).toEqual([
            { path: PRODUCT, title: 'Zapatillas Andes', views: 4, clicks: 5 },
            { path: '/', title: null, views: 0, clicks: 1 }
        ]);
    });

    it('aggregates desktop clicks on the grid, by element and by scroll reach', async () => {
        const project = await seed.project();
        const { first } = await seedProductPage(project);

        const res = await request(ctx.app, heatmapRoutes.heatmap, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { path: PRODUCT }
        });

        expect(res.status).toBe(200);
        const heatmap = res.data();
        expect(heatmap).toMatchObject({
            path: PRODUCT,
            mode: 'clicks',
            width: 'desktop',
            period: '7d',
            sessions: 3,
            clicks: 4,
            viewportWidth: 1440,
            documentHeight: 3000,
            snapshot: { sessionId: first.id, timestamp: utcAt(2, 10).getTime() + 500 }
        });
        expect(heatmap.averageDepth).toBeCloseTo(1.75 / 3);
        expect(heatmap.points).toEqual([
            { x: 0.5025, y: 100, weight: 3 },
            { x: 0.1025, y: 500, weight: 1 }
        ]);
        expect(heatmap.elements).toEqual([
            { selector: '#buy', text: 'Comprar', clicks: 3, rage: 1, dead: 0 },
            { selector: 'nav a', text: 'Inicio', clicks: 1, rage: 0, dead: 1 }
        ]);
        const reach = new Map(heatmap.reach.map((point) => [point.depth, point.share]));
        expect(heatmap.reach).toHaveLength(21);
        expect(reach.get(0)).toBe(1);
        expect(reach.get(25)).toBe(1);
        expect(reach.get(30)).toBeCloseTo(2 / 3);
        expect(reach.get(50)).toBeCloseTo(2 / 3);
        expect(reach.get(55)).toBeCloseTo(1 / 3);
        expect(reach.get(100)).toBeCloseTo(1 / 3);
    });

    it('keeps only rage clicks in rage mode and buckets by viewport width', async () => {
        const project = await seed.project();
        const { phone } = await seedProductPage(project);

        const rage = (await request(ctx.app, heatmapRoutes.heatmap, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { path: PRODUCT, mode: 'rage' }
        })).data();
        expect(rage.clicks).toBe(1);
        expect(rage.points).toEqual([{ x: 0.5025, y: 100, weight: 1 }]);

        const mobile = (await request(ctx.app, heatmapRoutes.heatmap, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { path: PRODUCT, width: 'mobile' }
        })).data();
        expect(mobile).toMatchObject({
            sessions: 1,
            clicks: 1,
            viewportWidth: 390,
            documentHeight: 6000,
            points: [{ x: 0.5025, y: 100, weight: 1 }],
            snapshot: { sessionId: phone.id, timestamp: utcAt(1, 14).getTime() + 500 }
        });
    });

    it('picks a snapshot taken right after the pageview and seeks past it', async () => {
        const project = await seed.project();
        const person = await seed.person(project);
        const late = await seed.session(project, person, { startedAt: utcAt(1, 16), viewportWidth: 1440 });
        await seed.event(late, { path: PRODUCT });
        const recordedAt = new Date(utcAt(1, 16).getTime() + 2000);
        await chunk(late, { hasFullSnapshot: true, firstAt: recordedAt, lastAt: utcAt(1, 16, 30) });

        const heatmap = (await request(ctx.app, heatmapRoutes.heatmap, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { path: PRODUCT }
        })).data();

        expect(heatmap.snapshot).toEqual({ sessionId: late.id, timestamp: recordedAt.getTime() + 500 });
    });

    it('falls back to typical sizes and no snapshot when a width has no data', async () => {
        const project = await seed.project();
        await seedProductPage(project);

        const tablet = (await request(ctx.app, heatmapRoutes.heatmap, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { path: PRODUCT, width: 'tablet' }
        })).data();

        expect(tablet).toMatchObject({
            sessions: 0,
            clicks: 0,
            averageDepth: 0,
            viewportWidth: 820,
            documentHeight: 0,
            points: [],
            elements: [],
            snapshot: null
        });
        expect(tablet.reach.every((point) => point.share === 0)).toBe(true);
    });

    it('rejects a heatmap without a path or with an unknown mode', async () => {
        const project = await seed.project();

        const missing = await request(ctx.app, heatmapRoutes.heatmap, { as: await actor('viewer'), params: { projectId: project.id } });
        expectError(missing, 400, 'Request::ValidationFailed');
        expect(missing.json()).toMatchObject({ errors: { path: 'Missing path' } });
        expectError(await request(ctx.app, heatmapRoutes.heatmap, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { path: PRODUCT, mode: 'hover' }
        }), 400, 'Request::ValidationFailed');
    });
});
