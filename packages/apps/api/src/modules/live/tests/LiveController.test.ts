import { overviewRoutes } from '@condor/contracts/overview/routes';
import { useApp } from '@tests/harness';
import { expectError, request } from '@tests/request';
import { actor } from '@tests/roles';
import { minutesAgo, seed } from '@tests/Seed';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

describe('LiveController', () => {
    const ctx = useApp();

    it('reports who is on the site right now and on which pages', async () => {
        const project = await seed.project();
        const someone = await seed.person(project);
        const another = await seed.person(project);
        await seed.session(project, someone, { startedAt: minutesAgo(2), exitPath: '/productos/:slug' });
        await seed.session(project, another, { startedAt: minutesAgo(1), exitPath: '/productos/:slug' });
        await seed.session(project, another, { startedAt: minutesAgo(1), exitPath: '/carrito' });
        await seed.session(project, someone, { startedAt: minutesAgo(90), exitPath: '/cuenta' });

        const res = await request(ctx.app, overviewRoutes.live, { as: await actor('viewer'), params: { projectId: project.id } });

        expect(res.data()).toEqual({
            count: 2,
            pages: [{ path: '/productos/:slug', people: 2 }, { path: '/carrito', people: 1 }]
        });
        expectError(await request(ctx.app, overviewRoutes.live, { as: await actor('viewer'), params: { projectId: randomUUID() } }), 404, 'Project::NotFound');
    });
});
