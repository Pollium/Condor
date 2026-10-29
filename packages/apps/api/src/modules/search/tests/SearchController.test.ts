import { SearchResults } from '@condor/contracts/search/domain';
import { searchRoutes } from '@condor/contracts/search/routes';
import { useApp } from '@tests/harness';
import { expectError, request } from '@tests/request';
import { actor } from '@tests/roles';
import { minutesAgo, seed } from '@tests/Seed';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

describe('SearchController', () => {
    const ctx = useApp();

    it('finds people with their latest session, issues and pages, case-insensitively and inside the project', async () => {
        const project = await seed.project();
        const camila = await seed.person(project, { name: 'Camila Ortega', email: 'camila@correo.cl', sessions: 2 });
        await seed.session(project, camila, { startedAt: minutesAgo(600), city: 'Valparaíso' });
        const latest = await seed.session(project, camila, { startedAt: minutesAgo(60), city: 'Santiago', device: 'mobile' });
        await seed.person(project, { name: 'Diego Paz' });
        const issue = await seed.issue(project, { errorType: 'OrtegaError', message: 'boom' });
        await seed.event(latest, { path: '/productos/ortega-poncho' });
        await seed.event(latest, { path: '/productos/ortega-poncho' });
        await seed.event(latest, { path: '/ortega' });
        await seed.event(latest, { type: 'click', path: '/ortega-click' });
        const other = await seed.project();
        await seed.person(other, { name: 'Camila Ortega' });

        const res = await request(ctx.app, searchRoutes.search, { as: await actor('viewer'), params: { projectId: project.id }, query: { q: 'ORTEGA' } });

        expect(res.data()).toEqual<SearchResults>({
            people: [{
                personId: camila.id,
                sessionId: latest.id,
                name: 'Camila Ortega',
                email: 'camila@correo.cl',
                userId: null,
                anonymousId: camila.anonymousId,
                city: 'Santiago',
                country: 'CL',
                os: 'macOS',
                device: 'mobile',
                sessions: 2,
                lastSeenAt: camila.lastSeenAt.toISOString()
            }],
            issues: [{ issueId: issue.id, errorType: 'OrtegaError', message: 'boom', occurrences: 1 }],
            pages: [{ path: '/productos/ortega-poncho', views: 2 }, { path: '/ortega', views: 1 }]
        });
    });

    it('returns nothing for a blank query and guards the project', async () => {
        const project = await seed.project();
        await seed.person(project, { name: 'Camila' });

        const res = await request(ctx.app, searchRoutes.search, { as: await actor('viewer'), params: { projectId: project.id }, query: { q: '  ' } });

        expect(res.data()).toEqual({ people: [], issues: [], pages: [] });
        expectError(await request(ctx.app, searchRoutes.search, { params: { projectId: project.id } }), 401, 'Auth::Unauthorized');
        expectError(await request(ctx.app, searchRoutes.search, { as: await actor('viewer'), params: { projectId: randomUUID() }, query: { q: 'x' } }), 404, 'Project::NotFound');
    });
});
