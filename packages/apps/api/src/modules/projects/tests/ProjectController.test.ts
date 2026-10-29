import Project from '../models/Project';
import Funnel from '@/modules/funnels/models/Funnel';
import Issue from '@/modules/issues/models/Issue';
import Person from '@/modules/sessions/models/Person';
import ReplayChunk from '@/modules/sessions/models/ReplayChunk';
import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { eventBus } from '@readable/events/EventBus';
import { objectStorage } from '@readable/storage/ObjectStorage';
import { projectRoutes } from '@condor/contracts/projects/routes';
import { useApp } from '@tests/harness';
import { expectError, request } from '@tests/request';
import { actor } from '@tests/roles';
import { DEFAULT_SETTINGS, minutesAgo, seed } from '@tests/Seed';
import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

const PUBLIC_KEY = /^ck_[A-Za-z0-9_-]{24}$/;

describe('ProjectController', () => {
    const ctx = useApp();

    it('lets a viewer list and read projects but not create, change or remove them', async () => {
        const project = await seed.project();
        const viewer = await actor('viewer');

        const listed = await request(ctx.app, projectRoutes.list, { as: viewer });
        expect(listed.status).toBe(200);
        expect(listed.data().map((entry) => entry.id)).toEqual([project.id]);
        expect((await request(ctx.app, projectRoutes.get, { as: viewer, params: { projectId: project.id } })).data())
            .toMatchObject({ id: project.id, publicKey: project.publicKey });

        expectError(await request(ctx.app, projectRoutes.create, { as: viewer, body: { name: 'Otra', host: 'otra.cl', platform: 'web' } }), 403, 'Auth::Forbidden');
        expectError(await request(ctx.app, projectRoutes.update, { as: viewer, params: { projectId: project.id }, body: { name: 'X' } }), 403, 'Auth::Forbidden');
        expectError(await request(ctx.app, projectRoutes.rotateKey, { as: viewer, params: { projectId: project.id } }), 403, 'Auth::Forbidden');
        expectError(await request(ctx.app, projectRoutes.remove, { as: viewer, params: { projectId: project.id } }), 403, 'Auth::Forbidden');
    });

    it('rejects anonymous callers, missing projects and malformed ids', async () => {
        expectError(await request(ctx.app, projectRoutes.list), 401, 'Auth::Unauthorized');
        expectError(await request(ctx.app, projectRoutes.get, { as: await actor('viewer'), params: { projectId: randomUUID() } }), 404, 'Project::NotFound');
        expectError(await request(ctx.app, projectRoutes.get, { as: await actor('viewer'), params: { projectId: 'not-a-uuid' } }), 400, 'Request::InvalidId');
    });

    it('creates a project with default settings, a fresh public key and a palette tint', async () => {
        const res = await request(ctx.app, projectRoutes.create, {
            as: await actor('admin'),
            body: { name: 'Tienda Andes', host: 'tiendaandes.cl', platform: 'web', timezone: 'America/Santiago' }
        });

        expect(res.status).toBe(201);
        const created = res.data();
        expect(created).toMatchObject({
            name: 'Tienda Andes',
            host: 'tiendaandes.cl',
            tint: '#0f62fe',
            lastEventAt: null,
            settings: { ...DEFAULT_SETTINGS, timezone: 'America/Santiago' }
        });
        expect(created.publicKey).toMatch(PUBLIC_KEY);
        expect((await request(ctx.app, projectRoutes.create, { as: await actor('admin'), body: { name: 'B', host: 'b.cl', platform: 'server' } })).data())
            .toMatchObject({ tint: '#8a3ffc', settings: { timezone: 'UTC' } });
    });

    it('refuses an invalid body and an unknown timezone', async () => {
        expectError(await request(ctx.app, projectRoutes.create, { as: await actor('admin'), body: { name: '', host: 'x.cl', platform: 'web' } }), 400, 'Request::ValidationFailed');

        const res = await request(ctx.app, projectRoutes.create, { as: await actor('admin'), body: { name: 'A', host: 'a.cl', platform: 'web', timezone: 'Mars/Olympus' } });
        expectError(res, 400, 'Request::ValidationFailed');
        expect(res.json()).toMatchObject({ errors: { timezone: 'Unknown timezone' } });
        expect(await Project.count()).toBe(0);
    });

    it('merges settings, validates route groups and tells ingest the project changed', async () => {
        const project = await seed.project();
        const emit = vi.spyOn(eventBus, 'emit');

        const res = await request(ctx.app, projectRoutes.updateSettings, {
            as: await actor('admin'),
            params: { projectId: project.id },
            body: { sampleRate: 25, routeGroups: ['/productos/:slug'], conversionEvent: 'purchase_completed' }
        });

        expect(res.data().settings).toEqual({ ...DEFAULT_SETTINGS, sampleRate: 25, routeGroups: ['/productos/:slug'], conversionEvent: 'purchase_completed' });
        expect(emit).toHaveBeenCalledWith('project.changed', { projectId: project.id, publicKeys: [project.publicKey] });

        const rejected = await request(ctx.app, projectRoutes.updateSettings, { as: await actor('admin'), params: { projectId: project.id }, body: { routeGroups: ['productos/:slug'] } });
        expectError(rejected, 400, 'Request::ValidationFailed');
        expect(rejected.json()).toMatchObject({ errors: { routeGroups: expect.any(String) } });
        expect((await Project.findOneByOrFail({ id: project.id })).settings.routeGroups).toEqual(['/productos/:slug']);
    });

    it('renames a project and announces it', async () => {
        const project = await seed.project();
        const emit = vi.spyOn(eventBus, 'emit');

        const res = await request(ctx.app, projectRoutes.update, { as: await actor('owner'), params: { projectId: project.id }, body: { host: 'tiendaandes.cl', tint: '#198038' } });

        expect(res.data()).toMatchObject({ host: 'tiendaandes.cl', tint: '#198038', name: project.name });
        expect(emit).toHaveBeenCalledWith('project.changed', { projectId: project.id, publicKeys: [project.publicKey] });
    });

    it('rotates the key and hands ingest both the old and the new one', async () => {
        const project = await seed.project();
        const emit = vi.spyOn(eventBus, 'emit');

        const rotated = (await request(ctx.app, projectRoutes.rotateKey, { as: await actor('admin'), params: { projectId: project.id } })).data();

        expect(rotated.publicKey).toMatch(PUBLIC_KEY);
        expect(rotated.publicKey).not.toBe(project.publicKey);
        expect(emit).toHaveBeenCalledWith('project.changed', { projectId: project.id, publicKeys: [project.publicKey, rotated.publicKey] });
    });

    it('removes a project with every row and replay object it owns, leaving other projects alone', async () => {
        const project = await seed.project();
        const other = await seed.project();
        const person = await seed.person(project);
        const session = await seed.session(project, person);
        await seed.event(session);
        await seed.issue(project);
        await seed.funnel(project);
        const chunk = await ReplayChunk.create({
            projectId: project.id,
            sessionId: session.id,
            seq: 0,
            storageKey: `replays/${project.id}/${session.id}/000000.json.gz`,
            size: 10,
            eventCount: 1,
            firstAt: session.startedAt,
            lastAt: session.endedAt
        }).save();
        await seed.event(await seed.session(other, await seed.person(other)));
        const remove = vi.spyOn(objectStorage, 'delete').mockResolvedValue();
        const emit = vi.spyOn(eventBus, 'emit');

        const res = await request(ctx.app, projectRoutes.remove, { as: await actor('admin'), params: { projectId: project.id } });

        expect(res.status).toBe(204);
        expect(remove).toHaveBeenCalledWith(chunk.storageKey);
        expect(emit).toHaveBeenCalledWith('project.changed', { projectId: project.id, publicKeys: [project.publicKey] });
        const where = { projectId: project.id };
        const counts = await Promise.all([
            Event.countBy(where),
            Session.countBy(where),
            Person.countBy(where),
            ReplayChunk.countBy(where),
            Issue.countBy(where),
            Funnel.countBy(where)
        ]);
        expect(counts).toEqual([0, 0, 0, 0, 0, 0]);
        expect(await Project.countBy({ id: project.id })).toBe(0);
        expect(await Event.countBy({ projectId: other.id })).toBe(1);
    });

    it('reports today\'s traffic in the project\'s timezone', async () => {
        const project = await seed.project({ lastEventAt: minutesAgo(1) });
        const person = await seed.person(project);
        const today = await seed.session(project, person, { startedAt: minutesAgo(1), hasReplay: true });
        await seed.event(today);
        await seed.event(today, { type: 'click' });
        await seed.event(await seed.session(project, person, { startedAt: minutesAgo(3 * 24 * 60) }));

        const res = await request(ctx.app, projectRoutes.status, { as: await actor('viewer'), params: { projectId: project.id } });

        expect(res.data()).toEqual({
            lastEventAt: project.lastEventAt?.toISOString(),
            eventsToday: 2,
            sessionsToday: 1,
            replaysToday: 1
        });
    });
});
