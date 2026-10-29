import { describe, expect, it } from 'vitest';
import { JOURNEY_EXIT, JOURNEY_OTHER } from '@condor/contracts/journeys/domain';
import { journeyRoutes } from '@condor/contracts/journeys/routes';
import { utcAt } from '@tests/clock';
import { useApp } from '@tests/harness';
import { expectError, request } from '@tests/request';
import { actor } from '@tests/roles';
import { seed } from '@tests/Seed';
import Project from '@/modules/projects/models/Project';

const PRODUCT = '/productos/:slug';

const visit = async (project: Project, paths: string[], hour: number) => {
    const session = await seed.session(project, await seed.person(project), { startedAt: utcAt(1, hour) });
    for(const [minute, path] of paths.entries()){
        await seed.event(session, { path, timestamp: utcAt(1, hour, minute) });
    }
};

const seedVisits = async (project: Project) => {
    await visit(project, ['/', PRODUCT, PRODUCT, '/carrito', '/checkout'], 8);
    await visit(project, ['/', PRODUCT], 9);
    await visit(project, ['/', PRODUCT], 10);
    await visit(project, ['/'], 11);
    await visit(project, ['/blog', '/', PRODUCT], 12);
};

describe('JourneyController', () => {
    const ctx = useApp();

    it('collapses repeats, links consecutive steps and sends ended sessions to the exit', async () => {
        const project = await seed.project();
        await seedVisits(project);

        const res = await request(ctx.app, journeyRoutes.journey, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { steps: 3, exits: 'true' }
        });

        expect(res.status).toBe(200);
        expect(res.data()).toEqual({
            period: '7d',
            steps: 3,
            start: null,
            sessions: 5,
            leftAfterFirst: 1,
            nodes: [
                { id: '1:/', step: 1, path: '/', sessions: 4 },
                { id: '1:/blog', step: 1, path: '/blog', sessions: 1 },
                { id: `2:${PRODUCT}`, step: 2, path: PRODUCT, sessions: 3 },
                { id: '2:/', step: 2, path: '/', sessions: 1 },
                { id: '3:/carrito', step: 3, path: '/carrito', sessions: 1 },
                { id: `3:${PRODUCT}`, step: 3, path: PRODUCT, sessions: 1 },
                { id: `2:${JOURNEY_EXIT}`, step: 2, path: JOURNEY_EXIT, sessions: 1 },
                { id: `3:${JOURNEY_EXIT}`, step: 3, path: JOURNEY_EXIT, sessions: 2 }
            ],
            links: [
                { source: '1:/', target: `2:${PRODUCT}`, sessions: 3 },
                { source: '1:/blog', target: '2:/', sessions: 1 },
                { source: '2:/', target: `3:${PRODUCT}`, sessions: 1 },
                { source: `2:${PRODUCT}`, target: '3:/carrito', sessions: 1 },
                { source: '1:/', target: `2:${JOURNEY_EXIT}`, sessions: 1 },
                { source: `2:${PRODUCT}`, target: `3:${JOURNEY_EXIT}`, sessions: 2 }
            ],
            routes: [
                { paths: ['/', PRODUCT], sessions: 2 },
                { paths: ['/'], sessions: 1 },
                { paths: ['/', PRODUCT, '/carrito'], sessions: 1 },
                { paths: ['/blog', '/', PRODUCT], sessions: 1 }
            ]
        });
    });

    it('leaves the exit out unless asked and starts at the first occurrence of a page', async () => {
        const project = await seed.project();
        await seedVisits(project);

        const journey = (await request(ctx.app, journeyRoutes.journey, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { steps: 3, start: PRODUCT }
        })).data();

        expect(journey).toMatchObject({ start: PRODUCT, sessions: 4, leftAfterFirst: 3 });
        expect(journey.nodes).toEqual([
            { id: `1:${PRODUCT}`, step: 1, path: PRODUCT, sessions: 4 },
            { id: '2:/carrito', step: 2, path: '/carrito', sessions: 1 },
            { id: '3:/checkout', step: 3, path: '/checkout', sessions: 1 }
        ]);
        expect(journey.links.map((link) => link.target)).toEqual(['2:/carrito', '3:/checkout']);
    });

    it('folds paths beyond the top of a step into the other node', async () => {
        const project = await seed.project();
        await visit(project, ['/p1'], 1);
        for(const [index, path] of ['/p1', '/p2', '/p3', '/p4', '/p5', '/p6', '/p7', '/p8'].entries()){
            await visit(project, [path], index + 2);
        }

        const journey = (await request(ctx.app, journeyRoutes.journey, {
            as: await actor('viewer'),
            params: { projectId: project.id }
        })).data();

        expect(journey.steps).toBe(4);
        expect(new Map(journey.nodes.map((node) => [node.path, node.sessions]))).toEqual(new Map([
            ['/p1', 2],
            [JOURNEY_OTHER, 2],
            ['/p2', 1],
            ['/p3', 1],
            ['/p4', 1],
            ['/p5', 1],
            ['/p6', 1]
        ]));
        expect(journey.leftAfterFirst).toBe(9);
    });

    it('rejects a step count outside 3 to 6', async () => {
        const project = await seed.project();

        expectError(await request(ctx.app, journeyRoutes.journey, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { steps: 7 }
        }), 400, 'Request::ValidationFailed');
    });
});
