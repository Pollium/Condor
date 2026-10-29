import Invitation from '../models/Invitation';
import { authRoutes } from '@condor/contracts/auth/routes';
import { InviteInput } from '@condor/contracts/members/http';
import { memberRoutes } from '@condor/contracts/members/routes';
import { config } from '@/shared/config';
import { seed } from '@tests/Seed';
import { useApp } from '@tests/harness';
import { request, expectError } from '@tests/request';
import { describe, expect, it } from 'vitest';

const HOUR_MS = 60 * 60 * 1000;
const NEWCOMER = {
    name: 'Grace Hopper',
    password: 'newcomer-password'
};

describe('InvitationController', () => {
    const ctx = useApp();

    it('invites, previews, accepts and lets the new member sign in', async () => {
        const owner = await seed.user('owner');

        const invited = await request(ctx.app, memberRoutes.invite, {
            as: owner.id,
            body: { email: 'Grace@Condor.test', role: 'admin' }
        });
        const { invitation, token } = invited.data();
        const preview = await request(ctx.app, memberRoutes.preview, { params: { token } });
        const accepted = await request(ctx.app, memberRoutes.accept, { body: { token, ...NEWCOMER } });
        const signIn = await request(ctx.app, authRoutes.signIn, { body: { email: 'grace@condor.test', password: NEWCOMER.password } });

        expect(invited.status).toBe(201);
        expect(invitation).toEqual({
            id: expect.any(String),
            email: 'grace@condor.test',
            role: 'admin',
            invitedBy: owner.name,
            expiresAt: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
        expect(preview.data()).toEqual({
            email: 'grace@condor.test',
            role: 'admin',
            invitedBy: owner.name,
            expiresAt: invitation.expiresAt
        });
        expect(accepted.status).toBe(201);
        expect(accepted.data().user).toMatchObject({ email: 'grace@condor.test', name: NEWCOMER.name, role: 'admin' });
        expect(signIn.data().user.id).toBe(accepted.data().user.id);
    });

    it('closes an invitation once it is accepted', async () => {
        const owner = await seed.user('owner');
        const { token } = (await request(ctx.app, memberRoutes.invite, { as: owner.id, body: { email: 'grace@condor.test', role: 'viewer' } })).data();
        await request(ctx.app, memberRoutes.accept, { body: { token, ...NEWCOMER } });

        expectError(await request(ctx.app, memberRoutes.preview, { params: { token } }), 404, 'Invitation::NotFound');
        expectError(await request(ctx.app, memberRoutes.accept, { body: { token, ...NEWCOMER } }), 404, 'Invitation::NotFound');
        expect((await request(ctx.app, memberRoutes.invitations, { as: owner.id })).data()).toEqual([]);
    });

    it('stores only a hash of the token', async () => {
        const owner = await seed.user('owner');

        const { invitation, token } = (await request(ctx.app, memberRoutes.invite, { as: owner.id, body: { email: 'grace@condor.test', role: 'viewer' } })).data();
        const stored = await Invitation.findOneByOrFail({ id: invitation.id });

        expect(stored.tokenHash).toMatch(/^[0-9a-f]{64}$/);
        expect(Buffer.from(token, 'base64url')).toHaveLength(32);
    });

    it('lets an admin invite viewers only', async () => {
        const admin = await seed.user('admin');

        const viewer = await request(ctx.app, memberRoutes.invite, { as: admin.id, body: { email: 'viewer@condor.test', role: 'viewer' } });
        const elevated = await request(ctx.app, memberRoutes.invite, { as: admin.id, body: { email: 'admin@condor.test', role: 'admin' } });

        expect(viewer.status).toBe(201);
        expectError(elevated, 403, 'Auth::Forbidden');
        expect(await Invitation.countBy({ email: 'admin@condor.test' })).toBe(0);
    });

    it('keeps viewers away from invitations', async () => {
        const viewer = await seed.user('viewer');

        expectError(await request(ctx.app, memberRoutes.invite, { as: viewer.id, body: { email: 'x@condor.test', role: 'viewer' } }),
            403, 'Auth::Forbidden');
        expectError(await request(ctx.app, memberRoutes.invitations, { as: viewer.id }), 403, 'Auth::Forbidden');
    });

    it('refuses to invite someone who is already a member', async () => {
        const owner = await seed.user('owner');
        const member = await seed.user('viewer');

        const res = await request(ctx.app, memberRoutes.invite, { as: owner.id, body: { email: member.email.toUpperCase(), role: 'admin' } });

        expectError(res, 409, 'Invitation::AlreadyMember');
    });

    it('replaces the pending invitation when the same email is invited again', async () => {
        const owner = await seed.user('owner');
        const body: InviteInput = { email: 'grace@condor.test', role: 'viewer' };

        const first = (await request(ctx.app, memberRoutes.invite, { as: owner.id, body })).data();
        const second = (await request(ctx.app, memberRoutes.invite, { as: owner.id, body })).data();
        const pending = await request(ctx.app, memberRoutes.invitations, { as: owner.id });

        expect(pending.data().map((invitation) => invitation.id)).toEqual([second.invitation.id]);
        expectError(await request(ctx.app, memberRoutes.preview, { params: { token: first.token } }), 404, 'Invitation::NotFound');
        expect((await request(ctx.app, memberRoutes.preview, { params: { token: second.token } })).status).toBe(200);
    });

    it('revokes an invitation so its link stops working', async () => {
        const owner = await seed.user('owner');
        const admin = await seed.user('admin');
        const { invitation, token } = (await request(ctx.app, memberRoutes.invite, { as: owner.id, body: { email: 'grace@condor.test', role: 'viewer' } })).data();

        const revoked = await request(ctx.app, memberRoutes.revoke, { as: admin.id, params: { invitationId: invitation.id } });

        expect(revoked.status).toBe(204);
        expectError(await request(ctx.app, memberRoutes.preview, { params: { token } }), 404, 'Invitation::NotFound');
        expectError(await request(ctx.app, memberRoutes.revoke, { as: admin.id, params: { invitationId: invitation.id } }),
            404, 'Invitation::NotFound');
    });

    it('expires an invitation after the configured lifetime', async () => {
        const owner = await seed.user('owner');
        const { invitation, token } = (await request(ctx.app, memberRoutes.invite, { as: owner.id, body: { email: 'grace@condor.test', role: 'viewer' } })).data();
        const lifetime = new Date(invitation.expiresAt).getTime() - Date.now();

        await Invitation.update({ id: invitation.id }, { expiresAt: new Date(Date.now() - HOUR_MS) });

        expect(lifetime).toBeGreaterThan((config.invitation.ttlHours - 1) * HOUR_MS);
        expect(lifetime).toBeLessThanOrEqual(config.invitation.ttlHours * HOUR_MS);
        expectError(await request(ctx.app, memberRoutes.preview, { params: { token } }), 410, 'Invitation::Expired');
        expectError(await request(ctx.app, memberRoutes.accept, { body: { token, ...NEWCOMER } }), 410, 'Invitation::Expired');
    });

    it('rejects an acceptance whose password is too short', async () => {
        const res = await request(ctx.app, memberRoutes.accept, { body: { token: 'anything', name: 'Grace', password: 'short' } });

        expectError(res, 400, 'Request::ValidationFailed');
        expect(res.json()).toMatchObject({ errors: { password: 'At least 8 characters' } });
    });
});
