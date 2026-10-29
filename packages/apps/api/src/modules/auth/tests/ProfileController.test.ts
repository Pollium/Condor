import User from '@/modules/users/models/User';
import { authRoutes } from '@condor/contracts/auth/routes';
import { seed, SEED_PASSWORD } from '@tests/Seed';
import { useApp } from '@tests/harness';
import { request, expectError } from '@tests/request';
import { describe, expect, it } from 'vitest';

describe('ProfileController', () => {
    const ctx = useApp();

    it('requires a token', async () => {
        expectError(await request(ctx.app, authRoutes.me), 401, 'Auth::Unauthorized');
    });

    it('returns the signed-in member without the password hash', async () => {
        const member = await seed.user('admin');

        const res = await request(ctx.app, authRoutes.me, { as: member.id });

        expect(res.data()).toEqual({
            id: member.id,
            email: member.email,
            name: member.name,
            role: 'admin',
            lastSignInAt: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
    });

    it('treats a token of a removed member as signed out', async () => {
        const member = await seed.user();
        await member.remove();

        expectError(await request(ctx.app, authRoutes.me, { as: member.id }), 401, 'Auth::Unauthorized');
    });

    it('updates the name and stores the new email lowercased', async () => {
        const member = await seed.user();

        const res = await request(ctx.app, authRoutes.updateProfile, {
            as: member.id,
            body: { name: 'Grace Hopper', email: 'Grace@Condor.test' }
        });

        expect(res.data()).toMatchObject({ name: 'Grace Hopper', email: 'grace@condor.test' });
        expect(await User.findOneByOrFail({ id: member.id })).toMatchObject({ name: 'Grace Hopper', email: 'grace@condor.test' });
    });

    it('refuses an email another member already uses', async () => {
        const member = await seed.user();
        const other = await seed.user();

        const res = await request(ctx.app, authRoutes.updateProfile, {
            as: member.id,
            body: { email: other.email.toUpperCase() }
        });

        expectError(res, 409, 'Auth::EmailTaken');
        expect((await User.findOneByOrFail({ id: member.id })).email).toBe(member.email);
    });

    it('rejects a malformed email', async () => {
        const member = await seed.user();

        const res = await request(ctx.app, authRoutes.updateProfile, { as: member.id, body: { email: 'not-an-email' } });

        expectError(res, 400, 'Request::ValidationFailed');
        expect(res.json()).toMatchObject({ errors: { email: 'Invalid email' } });
    });

    it('changes the password only when the current one matches', async () => {
        const member = await seed.user();
        const next = 'brand-new-password';

        const wrong = await request(ctx.app, authRoutes.changePassword, { as: member.id, body: { current: 'guess', next } });
        const changed = await request(ctx.app, authRoutes.changePassword, { as: member.id, body: { current: SEED_PASSWORD, next } });
        const oldSignIn = await request(ctx.app, authRoutes.signIn, { body: { email: member.email, password: SEED_PASSWORD } });
        const newSignIn = await request(ctx.app, authRoutes.signIn, { body: { email: member.email, password: next } });

        expectError(wrong, 400, 'Auth::WrongPassword');
        expect(changed.status).toBe(204);
        expectError(oldSignIn, 401, 'Auth::InvalidCredentials');
        expect(newSignIn.status).toBe(200);
    });
});
