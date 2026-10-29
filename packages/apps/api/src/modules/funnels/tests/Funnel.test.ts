import { describe, expect, it } from 'vitest';
import { funnelRoutes } from '@condor/contracts/funnels/routes';
import { Device } from '@condor/contracts/shared/analytics';
import { utcAt } from '@tests/clock';
import { useApp } from '@tests/harness';
import { expectError, request } from '@tests/request';
import { actor } from '@tests/roles';
import { seed } from '@tests/Seed';
import Funnel from '@/modules/funnels/models/Funnel';
import Project from '@/modules/projects/models/Project';

const PRODUCT = '/productos/:slug';

interface Step{
    at: Date;
    page?: string;
    event?: string;
}

const journey = async (project: Project, device: Device, steps: Step[]) => {
    const person = await seed.person(project);
    for(const step of steps){
        const session = await seed.session(project, person, { startedAt: step.at, device });
        await seed.event(session, step.page === undefined
            ? { type: 'custom', name: step.event, path: '/carrito', timestamp: step.at }
            : { type: 'pageview', path: step.page, timestamp: step.at });
    }
};

const seedPurchases = async (project: Project) => {
    await journey(project, 'mobile', [
        { at: utcAt(3, 10), page: PRODUCT },
        { at: utcAt(3, 10, 10), event: 'add_to_cart' },
        { at: utcAt(3, 10, 30), event: 'purchase_completed' }
    ]);
    await journey(project, 'desktop', [
        { at: utcAt(3, 12), page: PRODUCT },
        { at: utcAt(3, 14), event: 'add_to_cart' },
        { at: utcAt(2, 18), event: 'purchase_completed' }
    ]);
    await journey(project, 'desktop', [
        { at: utcAt(3, 8), event: 'add_to_cart' },
        { at: utcAt(3, 9), page: PRODUCT }
    ]);
    await journey(project, 'desktop', [
        { at: utcAt(10, 10), page: PRODUCT },
        { at: utcAt(10, 11), event: 'add_to_cart' },
        { at: utcAt(10, 12), event: 'purchase_completed' }
    ]);
    await journey(project, 'desktop', [{ at: utcAt(2, 9), event: 'purchase_completed' }]);
};

describe('FunnelController', () => {
    const ctx = useApp();

    it('creates a funnel for editors and lists only the project funnels in order', async () => {
        const project = await seed.project();
        await seed.funnel(await seed.project());
        const body = {
            name: 'Registro',
            steps: [
                { kind: 'page' as const, match: '/registro', label: 'Ve el registro' },
                { kind: 'event' as const, match: 'signup', label: 'Se registra' }
            ],
            windowHours: 2
        };

        const created = await request(ctx.app, funnelRoutes.create, { as: await actor('admin'), params: { projectId: project.id }, body });
        expect(created.status).toBe(201);
        expect(created.data()).toMatchObject({ ...body, projectId: project.id });

        const later = await seed.funnel(project);
        const list = await request(ctx.app, funnelRoutes.list, { as: await actor('viewer'), params: { projectId: project.id } });
        expect(list.data().map((funnel) => funnel.id)).toEqual([created.data().id, later.id]);
    });

    it('rejects an invalid funnel and a viewer writing one', async () => {
        const project = await seed.project();
        const body = {
            name: 'Uno',
            steps: [{ kind: 'page' as const, match: '/', label: 'Inicio' }],
            windowHours: 24
        };

        expectError(await request(ctx.app, funnelRoutes.create, { as: await actor('admin'), params: { projectId: project.id }, body }),
            400, 'Request::ValidationFailed');
        expectError(await request(ctx.app, funnelRoutes.create, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            body: { ...body, steps: [...body.steps, ...body.steps] }
        }), 403, 'Auth::Forbidden');
        expect(await Funnel.countBy({ projectId: project.id })).toBe(0);
    });

    it('updates and removes a funnel, never one from another project', async () => {
        const project = await seed.project();
        const funnel = await seed.funnel(project);
        const foreign = await seed.funnel(await seed.project());

        const updated = await request(ctx.app, funnelRoutes.update, {
            as: await actor('owner'),
            params: { projectId: project.id, funnelId: funnel.id },
            body: { name: 'Compra rápida', windowHours: 1 }
        });
        expect(updated.data()).toMatchObject({ id: funnel.id, name: 'Compra rápida', windowHours: 1, steps: funnel.steps });

        expectError(await request(ctx.app, funnelRoutes.update, {
            as: await actor('owner'),
            params: { projectId: project.id, funnelId: foreign.id },
            body: { name: 'Ajeno' }
        }), 404, 'Funnel::NotFound');

        const removed = await request(ctx.app, funnelRoutes.remove, { as: await actor('admin'), params: { projectId: project.id, funnelId: funnel.id } });
        expect(removed.status).toBe(204);
        expect(await Funnel.countBy({ id: funnel.id })).toBe(0);
        expect(await Funnel.countBy({ id: foreign.id })).toBe(1);
    });

    it('counts people through the steps in order within the window, with medians and devices', async () => {
        const project = await seed.project();
        const funnel = await seed.funnel(project);
        await seedPurchases(project);

        const res = await request(ctx.app, funnelRoutes.results, {
            as: await actor('viewer'),
            params: { projectId: project.id, funnelId: funnel.id }
        });

        expect(res.status).toBe(200);
        const result = res.data();
        expect(result).toMatchObject({
            funnelId: funnel.id,
            period: '7d',
            windowHours: 24,
            conversion: expect.closeTo(1 / 3),
            previousConversion: 1,
            medianSeconds: 1800,
            byDevice: [
                { device: 'desktop', people: [2, 1, 0] },
                { device: 'mobile', people: [1, 1, 1] }
            ]
        });
        expect(result.steps.map((step) => [step.people, step.fromPrevious, step.medianSeconds])).toEqual([
            [3, 1, null],
            [2, expect.closeTo(2 / 3), 3900],
            [1, 0.5, 1200]
        ]);
        expect(result.steps.map((step) => step.fromStart)).toEqual([1, expect.closeTo(2 / 3), expect.closeTo(1 / 3)]);
        expect(result.steps[0]).toMatchObject({ kind: 'page', match: PRODUCT, label: 'Ve un producto' });
    });

    it('widens the conversion window from the query', async () => {
        const project = await seed.project();
        const funnel = await seed.funnel(project);
        await seedPurchases(project);

        const result = (await request(ctx.app, funnelRoutes.results, {
            as: await actor('viewer'),
            params: { projectId: project.id, funnelId: funnel.id },
            query: { windowHours: 48 }
        })).data();

        expect(result.windowHours).toBe(48);
        expect(result.conversion).toBeCloseTo(2 / 3);
        expect(result.steps.map((step) => step.people)).toEqual([3, 2, 2]);
        expect(result.steps[2]?.medianSeconds).toBe((1200 + 28 * 3600) / 2);
        expect(result.medianSeconds).toBe((1800 + 30 * 3600) / 2);
        expectError(await request(ctx.app, funnelRoutes.results, {
            as: await actor('viewer'),
            params: { projectId: project.id, funnelId: funnel.id },
            query: { windowHours: 0 }
        }), 400, 'Request::ValidationFailed');
    });
});
