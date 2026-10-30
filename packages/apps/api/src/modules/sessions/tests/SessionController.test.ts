import ReplayChunk from '../models/ReplayChunk';
import Project from '@/modules/projects/models/Project';
import Session from '../models/Session';
import { objectStorage } from '@readable/storage/ObjectStorage';
import { SessionSummary } from '@condor/contracts/sessions/domain';
import { sessionRoutes } from '@condor/contracts/sessions/routes';
import { ApiResponse } from '@condor/contracts/shared/http';
import { useApp } from '@tests/harness';
import { expectError, request } from '@tests/request';
import { actor } from '@tests/roles';
import { minutesAgo, seed } from '@tests/Seed';
import { randomUUID } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { describe, expect, it, vi } from 'vitest';

const listOf = async (app: Parameters<typeof request>[0], project: Project, query: Record<string, string> = {}): Promise<string[]> => {
    const res = await request(app, sessionRoutes.list, { as: await actor('viewer'), params: { projectId: project.id }, query });
    expect(res.status).toBe(200);
    return res.json<ApiResponse<SessionSummary[]>>().data.map((session) => session.id);
};

const chunk = (session: Session, seq: number): Promise<ReplayChunk> => ReplayChunk.create({
    projectId: session.projectId,
    sessionId: session.id,
    seq,
    storageKey: `replays/${session.projectId}/${session.id}/${seq}.json.gz`,
    size: 64,
    eventCount: 2,
    firstAt: session.startedAt,
    lastAt: session.endedAt
}).save();

describe('SessionController', () => {
    const ctx = useApp();

    it('pages sessions newest first with the unpaginated total and never another project\'s', async () => {
        const project = await seed.project();
        const person = await seed.person(project, { name: 'Camila Rojas', email: 'camila@correo.cl' });
        const older = await seed.session(project, person, { startedAt: minutesAgo(90) });
        const newer = await seed.session(project, person, { startedAt: minutesAgo(30) });
        const other = await seed.project();
        await seed.session(other, await seed.person(other));

        const res = await request(ctx.app, sessionRoutes.list, { as: await actor('viewer'), params: { projectId: project.id }, query: { limit: 1 } });

        const envelope = res.json<ApiResponse<SessionSummary[]>>();
        expect(envelope.data.map((session) => session.id)).toEqual([newer.id]);
        expect(envelope.meta).toEqual({ total: 2, limit: 1, offset: 0 });
        expect(envelope.data[0]).toMatchObject({ name: 'Camila Rojas', email: 'camila@correo.cl', signals: { rage: 0, dead: 0, errors: 0, uturns: 0 } });
        expect(await listOf(ctx.app, project, { offset: '1' })).toEqual([older.id]);
        expectError(await request(ctx.app, sessionRoutes.list, { as: await actor('viewer'), params: { projectId: randomUUID() } }), 404, 'Project::NotFound');
    });

    it('filters by device, country, signal, conversion, identity, replay, person, period and segment', async () => {
        const project = await seed.project();
        const anonymous = await seed.person(project);
        const known = await seed.person(project, { userId: 'user-7', traits: { plan: 'pro' } });
        const mobile = await seed.session(project, anonymous, { device: 'mobile', country: 'AR', rageClicks: 2 });
        const buyer = await seed.session(project, known, { converted: true, hasReplay: true, userId: 'user-7' });
        const ancient = await seed.session(project, anonymous, { startedAt: minutesAgo(40 * 24 * 60), uturns: 1 });

        expect(await listOf(ctx.app, project, { device: 'mobile' })).toEqual([mobile.id]);
        expect(await listOf(ctx.app, project, { country: 'AR' })).toEqual([mobile.id]);
        expect(await listOf(ctx.app, project, { signal: 'rage' })).toEqual([mobile.id]);
        expect(await listOf(ctx.app, project, { signal: 'uturn' })).toEqual([ancient.id]);
        expect(await listOf(ctx.app, project, { converted: 'true' })).toEqual([buyer.id]);
        expect(await listOf(ctx.app, project, { identified: 'true' })).toEqual([buyer.id]);
        expect(await listOf(ctx.app, project, { replay: 'true' })).toEqual([buyer.id]);
        expect((await listOf(ctx.app, project, { personId: anonymous.id })).sort()).toEqual([mobile.id, ancient.id].sort());
        expect(await listOf(ctx.app, project, { period: '30d', device: 'desktop' })).toEqual([buyer.id]);
        expect(await listOf(ctx.app, project, { traitKey: 'plan', traitValue: 'pro' })).toEqual([buyer.id]);
        expect(await listOf(ctx.app, project, { traitKey: 'plan', traitValue: 'free' })).toEqual([]);
        expectError(await request(ctx.app, sessionRoutes.list, { as: await actor('viewer'), params: { projectId: project.id }, query: { sort: 'loudest' } }), 400, 'Request::ValidationFailed');
    });

    it('searches people by name, email and id and sessions by city and entry page', async () => {
        const project = await seed.project();
        const camila = await seed.session(project, await seed.person(project, { name: 'Camila Rojas', email: 'camila@correo.cl' }), { city: 'Santiago' });
        const lucas = await seed.session(project, await seed.person(project, { anonymousId: 'anon_lucas_100%' }), { city: 'Rosario', entryPath: '/ofertas' });

        expect(await listOf(ctx.app, project, { search: 'rojas' })).toEqual([camila.id]);
        expect(await listOf(ctx.app, project, { search: 'CORREO.cl' })).toEqual([camila.id]);
        expect(await listOf(ctx.app, project, { search: 'rosario' })).toEqual([lucas.id]);
        expect(await listOf(ctx.app, project, { search: '/ofertas' })).toEqual([lucas.id]);
        expect(await listOf(ctx.app, project, { search: '100%' })).toEqual([lucas.id]);
        expect(await listOf(ctx.app, project, { search: '%' })).toEqual([lucas.id]);
    });

    it('sorts by length, event count and frustration', async () => {
        const project = await seed.project();
        const person = await seed.person(project);
        const long = await seed.session(project, person, { duration: 900, events: 3 });
        const busy = await seed.session(project, person, { duration: 60, events: 80 });
        const angry = await seed.session(project, person, { duration: 30, events: 5, rageClicks: 3, errors: 2 });

        expect(await listOf(ctx.app, project, { sort: 'longest' })).toEqual([long.id, busy.id, angry.id]);
        expect(await listOf(ctx.app, project, { sort: 'events' })).toEqual([busy.id, angry.id, long.id]);
        expect((await listOf(ctx.app, project, { sort: 'frustrated' }))[0]).toBe(angry.id);
    });

    it('draws each session\'s activity as event density across its own length', async () => {
        const project = await seed.project();
        const session = await seed.session(project, await seed.person(project), { startedAt: minutesAgo(10), duration: 280 });
        await seed.event(session, { timestamp: session.startedAt });
        await seed.event(session, { timestamp: new Date(session.startedAt.getTime() + 5_000) });
        await seed.event(session, { timestamp: session.endedAt });
        const quiet = await seed.session(project, await seed.person(project), { startedAt: minutesAgo(20) });

        const res = await request(ctx.app, sessionRoutes.list, { as: await actor('viewer'), params: { projectId: project.id } });

        const [busy, idle] = res.json<ApiResponse<SessionSummary[]>>().data;
        expect(busy.activity).toHaveLength(28);
        expect(busy.activity[0]).toBe(1);
        expect(busy.activity[27]).toBe(0.5);
        expect(busy.activity.slice(1, 27).every((density) => density === 0)).toBe(true);
        expect(idle.id).toBe(quiet.id);
        expect(idle.activity).toEqual(Array.from({ length: 28 }, () => 0));
    });

    it('lists live sessions newest first with the page each one is on', async () => {
        const project = await seed.project();
        const person = await seed.person(project);
        const earlier = await seed.session(project, person, { startedAt: minutesAgo(3), duration: 120, exitPath: '/carrito' });
        const latest = await seed.session(project, person, { startedAt: minutesAgo(1), duration: 30, exitPath: '/checkout' });
        await seed.session(project, person, { startedAt: minutesAgo(30), duration: 60 });

        const res = await request(ctx.app, sessionRoutes.live, { as: await actor('viewer'), params: { projectId: project.id } });

        expect(res.data().map((session) => [session.id, session.live, session.currentPath])).toEqual([
            [latest.id, true, '/checkout'],
            [earlier.id, true, '/carrito']
        ]);
    });

    it('returns a session with its person and an ordered timeline offset from its start', async () => {
        const project = await seed.project();
        const person = await seed.person(project, { userId: 'user-3', name: 'Diego Paz' });
        const session = await seed.session(project, person, { startedAt: minutesAgo(5), utmCampaign: 'verano' });
        const click = await seed.event(session, { type: 'click', selector: 'button.pay', timestamp: new Date(session.startedAt.getTime() + 4_000) });
        const view = await seed.event(session, { timestamp: session.startedAt });

        const res = await request(ctx.app, sessionRoutes.get, { as: await actor('viewer'), params: { projectId: project.id, sessionId: session.id } });

        const detail = res.data();
        expect(detail).toMatchObject({ id: session.id, utmCampaign: 'verano', person: { id: person.id, userId: 'user-3', name: 'Diego Paz' } });
        expect(detail.timeline.map((event) => [event.id, event.offsetMs])).toEqual([[view.id, 0], [click.id, 4000]]);
        expect(detail.timeline[1]).toMatchObject({ type: 'click', selector: 'button.pay' });

        const other = await seed.project();
        expectError(await request(ctx.app, sessionRoutes.get, { as: await actor('viewer'), params: { projectId: other.id, sessionId: session.id } }), 404, 'Session::NotFound');
    });

    it('stitches every replay chunk from storage into one timeline', async () => {
        const project = await seed.project();
        const session = await seed.session(project, await seed.person(project), { hasReplay: true });
        const first = await chunk(session, 0);
        const second = await chunk(session, 1);
        const stored = new Map([
            [first.storageKey, [{ type: 4, timestamp: 100 }, { type: 2, timestamp: 300 }]],
            [second.storageKey, [{ type: 3, timestamp: 200 }, { type: 3, timestamp: 400 }]]
        ]);
        const get = vi.spyOn(objectStorage, 'get').mockImplementation(async (key: string) => gzipSync(JSON.stringify(stored.get(key))));

        const res = await request(ctx.app, sessionRoutes.replay, { as: await actor('viewer'), params: { projectId: project.id, sessionId: session.id } });

        expect(get).toHaveBeenCalledTimes(2);
        expect(res.data()).toEqual({
            sessionId: session.id,
            chunks: 2,
            events: [
                { type: 4, timestamp: 100 },
                { type: 3, timestamp: 200 },
                { type: 2, timestamp: 300 },
                { type: 3, timestamp: 400 }
            ]
        });
    });

    it('answers NoReplay for a session that recorded nothing', async () => {
        const project = await seed.project();
        const session = await seed.session(project, await seed.person(project));

        expectError(await request(ctx.app, sessionRoutes.replay, { as: await actor('viewer'), params: { projectId: project.id, sessionId: session.id } }), 404, 'Session::NoReplay');
    });

    it('returns a person with their recent sessions, only inside their project', async () => {
        const project = await seed.project();
        const person = await seed.person(project, { email: 'ana@correo.cl', sessions: 2 });
        const first = await seed.session(project, person, { startedAt: minutesAgo(600) });
        const second = await seed.session(project, person, { startedAt: minutesAgo(60) });

        const res = await request(ctx.app, sessionRoutes.person, { as: await actor('viewer'), params: { projectId: project.id, personId: person.id } });

        expect(res.data()).toMatchObject({ id: person.id, email: 'ana@correo.cl', sessions: 2 });
        expect(res.data().recent.map((session) => session.id)).toEqual([second.id, first.id]);

        const other = await seed.project();
        expectError(await request(ctx.app, sessionRoutes.person, { as: await actor('viewer'), params: { projectId: other.id, personId: person.id } }), 404, 'Session::PersonNotFound');
    });
});
