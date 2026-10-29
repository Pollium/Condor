import { describe, expect, it } from 'vitest';
import { issueRoutes } from '@condor/contracts/issues/routes';
import { utcAt } from '@tests/clock';
import { useApp } from '@tests/harness';
import { expectError, request, route } from '@tests/request';
import { actor } from '@tests/roles';
import { minutesAgo, seed } from '@tests/Seed';
import Issue from '@/modules/issues/models/Issue';
import Project from '@/modules/projects/models/Project';
import Session from '@/modules/sessions/models/Session';

const fail = (session: Session, issue: Issue, timestamp: Date) =>
    seed.event(session, { type: 'error', name: issue.id, text: issue.message, timestamp });

const seedIssues = async (project: Project) => {
    const fresh = await seed.issue(project, { firstSeenAt: utcAt(1, 9), lastSeenAt: utcAt(1, 10) });
    const regressed = await seed.issue(project, {
        errorType: 'NetworkError',
        message: 'Failed to fetch /api/cart',
        firstSeenAt: utcAt(30, 0),
        lastSeenAt: utcAt(1, 8),
        regressedAt: utcAt(1, 8)
    });
    const resolved = await seed.issue(project, {
        errorType: 'RangeError',
        message: 'Invalid array length',
        status: 'resolved',
        firstSeenAt: utcAt(30, 0),
        lastSeenAt: utcAt(2, 8),
        resolvedAt: utcAt(2, 9)
    });
    const lingering = await seed.issue(project, { firstSeenAt: utcAt(30, 0), lastSeenAt: utcAt(3, 0) });
    await seed.issue(project, { firstSeenAt: utcAt(40, 0), lastSeenAt: utcAt(20, 0) });

    const [first, second] = await Promise.all([seed.person(project), seed.person(project)]);
    const firstSession = await seed.session(project, first, { startedAt: utcAt(1, 9) });
    const secondSession = await seed.session(project, second, { startedAt: utcAt(1, 10) });
    await fail(firstSession, fresh, utcAt(1, 9));
    await fail(firstSession, fresh, utcAt(1, 9, 30));
    await fail(secondSession, fresh, utcAt(1, 10));
    await fail(secondSession, fresh, utcAt(10, 10));

    return { fresh, regressed, resolved, lingering };
};

describe('IssueController', () => {
    const ctx = useApp();

    it('lists the issues seen in the period with their state, reach and trend', async () => {
        const project = await seed.project();
        const { fresh, regressed, resolved, lingering } = await seedIssues(project);

        const res = await request(ctx.app, issueRoutes.list, { as: await actor('viewer'), params: { projectId: project.id } });

        expect(res.status).toBe(200);
        const issues = res.data();
        expect(issues.map((issue) => [issue.id, issue.state])).toEqual([
            [fresh.id, 'new'],
            [regressed.id, 'regressed'],
            [resolved.id, 'resolved'],
            [lingering.id, 'open']
        ]);
        expect(issues[0]).toMatchObject({ sessions: 2, people: 2, trend: [0, 0, 0, 0, 0, 3, 0] });
        expect(issues[0]).not.toHaveProperty('stack');
        expect(issues[1]).toMatchObject({ sessions: 0, people: 0, trend: [0, 0, 0, 0, 0, 0, 0] });
    });

    it('filters by status and searches the message, escaping wildcards', async () => {
        const project = await seed.project();
        const { regressed, resolved } = await seedIssues(project);
        const list = async (query: Record<string, string>) => (await request(ctx.app, issueRoutes.list, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query
        })).data().map((issue) => issue.id);

        expect(await list({ status: 'resolved' })).toEqual([resolved.id]);
        expect(await list({ search: 'FETCH' })).toEqual([regressed.id]);
        expect(await list({ search: '%' })).toEqual([]);
        expectError(await request(ctx.app, issueRoutes.list, {
            as: await actor('viewer'),
            params: { projectId: project.id },
            query: { status: 'archived' }
        }), 400, 'Request::ValidationFailed');
    });

    it('details an issue with its stack, the last 24 hours and replayed sessions first', async () => {
        const project = await seed.project();
        const issue = await seed.issue(project, { stack: "TypeError: Cannot read properties of undefined\n    at cart.ts:42:13" });
        const person = await seed.person(project);
        const replayed = await seed.session(project, person, { startedAt: minutesAgo(30 * 60), hasReplay: true });
        const plain = await seed.session(project, person, { startedAt: minutesAgo(130) });
        await fail(replayed, issue, minutesAgo(30 * 60));
        await fail(plain, issue, minutesAgo(120));

        const res = await request(ctx.app, issueRoutes.get, {
            as: await actor('viewer'),
            params: { projectId: project.id, issueId: issue.id }
        });

        expect(res.status).toBe(200);
        const detail = res.data();
        expect(detail).toMatchObject({
            id: issue.id,
            stack: issue.stack,
            sessions: 2,
            people: 1,
            recentSessions: [replayed.id, plain.id]
        });
        expect(detail.hourly).toHaveLength(24);
        expect(detail.hourly[21]).toBe(1);
        expect(detail.hourly.reduce((sum, count) => sum + count, 0)).toBe(1);
        expectError(await request(ctx.app, issueRoutes.get, {
            as: await actor('viewer'),
            params: { projectId: (await seed.project()).id, issueId: issue.id }
        }), 404, 'Issue::NotFound');
    });

    it('resolves and reopens an issue for editors only', async () => {
        const project = await seed.project();
        const { fresh, regressed } = await seedIssues(project);

        expectError(await request(ctx.app, issueRoutes.update, {
            as: await actor('viewer'),
            params: { projectId: project.id, issueId: fresh.id },
            body: { status: 'resolved' }
        }), 403, 'Auth::Forbidden');

        const resolved = await request(ctx.app, issueRoutes.update, {
            as: await actor('admin'),
            params: { projectId: project.id, issueId: fresh.id },
            body: { status: 'resolved' }
        });
        expect(resolved.data()).toMatchObject({ id: fresh.id, status: 'resolved', state: 'resolved', sessions: 2 });
        expect((await Issue.findOneByOrFail({ id: fresh.id })).resolvedAt).toBeInstanceOf(Date);

        const reopened = await request(ctx.app, issueRoutes.update, {
            as: await actor('owner'),
            params: { projectId: project.id, issueId: regressed.id },
            body: { status: 'open' }
        });
        expect(reopened.data()).toMatchObject({ status: 'open', state: 'open' });
        expect(await Issue.findOneByOrFail({ id: regressed.id })).toMatchObject({ resolvedAt: null, regressedAt: null });
    });

    it('rejects an unknown status and an issue of another project', async () => {
        const project = await seed.project();
        const foreign = await seed.issue(await seed.project());

        expectError(await request(ctx.app, issueRoutes.update, {
            as: await actor('admin'),
            params: { projectId: project.id, issueId: foreign.id },
            body: { status: 'resolved' }
        }), 404, 'Issue::NotFound');
        expectError(await request(ctx.app, route(issueRoutes.update.method, issueRoutes.update.path), {
            as: await actor('admin'),
            params: { projectId: project.id, issueId: foreign.id },
            body: { status: 'deleted' }
        }), 400, 'Request::ValidationFailed');
        expect((await Issue.findOneByOrFail({ id: foreign.id })).status).toBe('open');
    });
});
