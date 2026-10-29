import { readableConfig } from '../config';
import { Redis, RedisOptions } from 'ioredis';

export const redisOptions = (): RedisOptions => {
    const { host, port } = readableConfig().redis;
    return { host, port };
};

export const createRedis = (options: RedisOptions = {}): Redis => new Redis({ ...redisOptions(), ...options });

let client: Redis | undefined;

const connect = (): Redis => {
    client ??= createRedis({ lazyConnect: true });
    return client;
};

export const redis = new Proxy({} as Redis, {
    get(_target, prop){
        const value = Reflect.get(connect(), prop);
        return typeof value === 'function' ? value.bind(connect()) : value;
    }
});
