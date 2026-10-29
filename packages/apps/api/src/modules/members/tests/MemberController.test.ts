import User from '@/modules/users/models/User';
import { memberRoutes } from '@condor/contracts/members/routes';
import { seed } from '@tests/Seed';
import { useApp } from '@tests/harness';
import { request, expectError } from '@tests/request';
import { describe, expect, it } from 'vitest';

const UNKNOWN_ID = '0196f1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b';

describe('MemberController', () => {
    const ctx = useApp();

    it('lists every member to any signed-in member', async () => {
        const owner = await seed.user('owner');
        const admin = await seed.user('admin');
        const viewer = await seed.user('viewer');

        const res = await request(ctx.app, memberRoutes.list, { as: viewer.id });

        expect(res.data().map((member) => [member.id, member.role])).toEqual([
            [owner.id, 'owner'],
            [admin.id, 'admin'],
            [viewer.id, 'viewer']
        ]);
        expect(res.data()[0]).not.toHaveProperty('passwordHash');
    });

    it('rejects listing without a token', async () => {
        expectError(await request(ctx.app, memberRoutes.list), 401, 'Auth::Unauthorized');
    });

    it('lets an owner change another member role', async () => {
        const owner = await seed.user('owner');
        const viewer = await seed.user('viewer');

        const res = await request(ctx.app, memberRoutes.update, {
            as: owner.id,
            params: { userId: viewer.id },
            body: { role: 'owner' }
        });

        expect(res.data()).toMatchObject({ id: viewer.id, role: 'owner' });
        expect((await User.findOneByOrFail({ id: viewer.id })).role).toBe('owner');
    });

    it('keeps role changes and removals to owners', async () => {
        await seed.user('owner');
        const admin = await seed.user('admin');
        const viewer = await seed.user('viewer');

        const update = await request(ctx.app, memberRoutes.update, { as: admin.id, params: { userId: viewer.id }, body: { role: 'admin' } });
        const remove = await request(ctx.app, memberRoutes.remove, { as: admin.id, params: { userId: viewer.id } });

        expectError(update, 403, 'Auth::Forbidden');
        expectError(remove, 403, 'Auth::Forbidden');
        expect((await User.findOneByOrFail({ id: viewer.id })).role).toBe('viewer');
    });

    it('refuses to change or remove yourself', async () => {
        const owner = await seed.user('owner');

        const update = await request(ctx.app, memberRoutes.update, { as: owner.id, params: { userId: owner.id }, body: { role: 'viewer' } });
        const remove = await request(ctx.app, memberRoutes.remove, { as: owner.id, params: { userId: owner.id } });

        expectError(update, 409, 'Member::CannotChangeSelf');
        expectError(remove, 409, 'Member::CannotChangeSelf');
        expect(await User.countBy({ id: owner.id, role: 'owner' })).toBe(1);
    });

    it('removes a member, whose token then stops working', async () => {
        const owner = await seed.user('owner');
        const viewer = await seed.user('viewer');

        const res = await request(ctx.app, memberRoutes.remove, { as: owner.id, params: { userId: viewer.id } });

        expect(res.status).toBe(204);
        expect(await User.existsBy({ id: viewer.id })).toBe(false);
        expectError(await request(ctx.app, memberRoutes.list, { as: viewer.id }), 401, 'Auth::Unauthorized');
    });

    it('returns 404 for an unknown member and 400 for a malformed id', async () => {
        const owner = await seed.user('owner');

        expectError(await request(ctx.app, memberRoutes.remove, { as: owner.id, params: { userId: UNKNOWN_ID } }),
            404, 'Member::NotFound');
        expectError(await request(ctx.app, memberRoutes.remove, { as: owner.id, params: { userId: 'nope' } }),
            400, 'Request::InvalidId');
    });

    it('keeps an owner when two owners remove each other at once', async () => {
        const first = await seed.user('owner');
        const second = await seed.user('owner');

        const results = await Promise.all([
            request(ctx.app, memberRoutes.remove, { as: first.id, params: { userId: second.id } }),
            request(ctx.app, memberRoutes.remove, { as: second.id, params: { userId: first.id } })
        ]);

        expect(results.filter((res) => res.status === 204)).toHaveLength(1);
        expect(await User.countBy({ role: 'owner' })).toBe(1);
    });
});
