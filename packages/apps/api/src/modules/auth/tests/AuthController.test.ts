import User from '@/modules/users/models/User';
import { rateLimitStore } from '@readable/decorators/middleware/RateLimit';
import { authRoutes } from '@condor/contracts/auth/routes';
import { seed, SEED_PASSWORD } from '@tests/Seed';
import { useApp } from '@tests/harness';
import { request, expectError } from '@tests/request';
import { describe, expect, it, vi } from 'vitest';

const OWNER = {
    name: 'Ada Lovelace',
    email: 'Ada@Condor.test',
    password: 'owner-password-123'
};

describe('AuthController', () => {
    const ctx = useApp();

    it('opens setup until the first owner exists, then closes it', async () => {
        const before = await request(ctx.app, authRoutes.setupStatus);
        const created = await request(ctx.app, authRoutes.setup, { body: OWNER });
        const after = await request(ctx.app, authRoutes.setupStatus);
        const again = await request(ctx.app, authRoutes.setup, { body: { ...OWNER, email: 'grace@condor.test' } });

        expect(before.data()).toEqual({ needsOwner: true });
        expect(created.status).toBe(201);
        expect(created.data().user).toMatchObject({ email: 'ada@condor.test', name: OWNER.name, role: 'owner' });
        expect(created.data().user).not.toHaveProperty('passwordHash');
        expect(after.data()).toEqual({ needsOwner: false });
        expectError(again, 409, 'Auth::SetupClosed');
        expect(await User.count()).toBe(1);
    });

    it('signs the new owner in with the token setup returns', async () => {
        const { token, user } = (await request(ctx.app, authRoutes.setup, { body: OWNER })).data();

        const me = await request(ctx.app, authRoutes.me, { headers: { authorization: `Bearer ${token}` } });

        expect(me.data()).toMatchObject({ id: user.id, role: 'owner' });
        expect(user.lastSignInAt).not.toBeNull();
    });

    it('creates a single owner when two setups race', async () => {
        const results = await Promise.all([
            request(ctx.app, authRoutes.setup, { body: OWNER }),
            request(ctx.app, authRoutes.setup, { body: { ...OWNER, email: 'grace@condor.test' } })
        ]);

        expect(results.map((res) => res.status).sort()).toEqual([201, 409]);
        expect(await User.count()).toBe(1);
    });

    it('rejects a setup whose password is too short', async () => {
        const res = await request(ctx.app, authRoutes.setup, { body: { ...OWNER, password: 'short' } });

        expectError(res, 400, 'Request::ValidationFailed');
        expect(res.json()).toMatchObject({ errors: { password: 'At least 8 characters' } });
    });

    it('signs in with any email casing and records when', async () => {
        const member = await seed.user('admin');

        const res = await request(ctx.app, authRoutes.signIn, {
            body: { email: member.email.toUpperCase(), password: SEED_PASSWORD }
        });

        expect(res.status).toBe(200);
        expect(res.data().user).toMatchObject({ id: member.id, role: 'admin' });
        expect(res.data().token).toEqual(expect.any(String));
        expect((await User.findOneByOrFail({ id: member.id })).lastSignInAt).toBeInstanceOf(Date);
    });

    it('refuses a wrong password and an unknown email alike', async () => {
        const member = await seed.user();

        const wrong = await request(ctx.app, authRoutes.signIn, { body: { email: member.email, password: 'not-the-password' } });
        const unknown = await request(ctx.app, authRoutes.signIn, { body: { email: 'nobody@condor.test', password: SEED_PASSWORD } });

        expectError(wrong, 401, 'Auth::InvalidCredentials');
        expectError(unknown, 401, 'Auth::InvalidCredentials');
        expect((await User.findOneByOrFail({ id: member.id })).lastSignInAt).toBeNull();
    });

    it('limits sign-in attempts', async () => {
        const member = await seed.user();
        vi.mocked(rateLimitStore.hit).mockResolvedValueOnce({ count: 6, resetMs: 30_000 });

        const res = await request(ctx.app, authRoutes.signIn, { body: { email: member.email, password: SEED_PASSWORD } });

        expectError(res, 429, 'RateLimit::TooManyRequests');
    });
});
