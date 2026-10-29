import { ReadableDatabaseConfig, ReadableRedisConfig, ReadableStorageConfig } from './config';
import { optionalEnv, requiredEnv } from './utils/env';

const DEFAULT_STORAGE_REGION = 'us-east-1';

export const serviceConfig = (corsFallback: string) => ({
    port: Number(requiredEnv('PORT')),
    corsOrigins: (optionalEnv('CORS_ORIGIN') ?? corsFallback)
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin !== ''),
    database: {
        url: requiredEnv('DATABASE_URL'),
        schema: optionalEnv('DATABASE_SCHEMA'),
        synchronize: optionalEnv('DATABASE_SYNCHRONIZE') !== 'false'
    } satisfies ReadableDatabaseConfig,
    log: {
        level: optionalEnv('LOG_LEVEL') ?? 'info',
        pretty: optionalEnv('LOG_PRETTY') === 'true'
    }
});

export const redisFromEnv = (): ReadableRedisConfig => ({
    host: requiredEnv('REDIS_HOST'),
    port: Number(requiredEnv('REDIS_PORT'))
});

export const storageFromEnv = (): ReadableStorageConfig => ({
    endpoint: requiredEnv('STORAGE_ENDPOINT'),
    region: optionalEnv('STORAGE_REGION') ?? DEFAULT_STORAGE_REGION,
    accessKey: requiredEnv('STORAGE_ACCESS_KEY'),
    secretKey: requiredEnv('STORAGE_SECRET_KEY'),
    bucket: requiredEnv('STORAGE_BUCKET'),
    publicUrl: requiredEnv('STORAGE_PUBLIC_URL')
});
