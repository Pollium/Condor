import { RateLimitHit, RateLimitStore } from '../contracts/rate-limit';
import { redis } from '../redis/RedisClient';

const PREFIX = 'rl:';

const HIT = `
local n = redis.call('INCR', KEYS[1])
if n == 1 then
    redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return { n, redis.call('PTTL', KEYS[1]) }
`;

export default class RedisRateLimitStore implements RateLimitStore{
    async hit(key: string, windowMs: number): Promise<RateLimitHit>{
        const [count, ttl] = await redis.eval(HIT, 1, `${PREFIX}${key}`, String(windowMs)) as [number, number];

        return {
            count,
            resetMs: ttl > 0 ? ttl : windowMs
        };
    }
}
