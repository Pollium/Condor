import { beforeEach, describe, expect, it, vi } from 'vitest';

const evalFn = vi.fn();

vi.mock('../lib/redis/RedisClient', () => ({
    redis: { eval: (...args: unknown[]) => evalFn(...args) }
}));

const { default: RedisRateLimitStore } = await import('../lib/services/RedisRateLimitStore');

describe('RedisRateLimitStore', () => {
    const store = new RedisRateLimitStore();

    beforeEach(() => evalFn.mockReset());

    it('increments a namespaced key and returns the remaining window', async () => {
        evalFn.mockResolvedValue([1, 60_000]);

        await expect(store.hit('1.2.3.4:/auth/sign-in', 60_000)).resolves.toEqual({
            count: 1,
            resetMs: 60_000
        });

        expect(evalFn).toHaveBeenCalledWith(
            expect.any(String),
            1,
            'rl:1.2.3.4:/auth/sign-in',
            '60000'
        );
    });

    it('treats a missing ttl as a fresh window rather than retrying immediately', async () => {
        evalFn.mockResolvedValue([2, -1]);

        await expect(store.hit('ip', 10_000)).resolves.toEqual({ count: 2, resetMs: 10_000 });
    });
});
