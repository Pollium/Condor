import {
    configure,
    redisFromEnv,
    serviceConfig,
    storageFromEnv,
    optionalEnv,
    requiredEnv
} from '@pollium/readable/app/config';
import { resolve } from 'node:path';

const service = serviceConfig('http://localhost:5190');

export const config = {
    ...service,
    database: { ...service.database, timestamptz: true },
    jwtSecret: requiredEnv('JWT_SECRET'),
    redis: redisFromEnv(),
    storage: storageFromEnv(),
    invitation: {
        ttlHours: Number(optionalEnv('INVITATION_TTL_HOURS') ?? 168)
    },
    geoipDatabase: optionalEnv('GEOIP_DATABASE') ?? null,
    trustGeoHeaders: optionalEnv('TRUST_GEO_HEADERS') === 'true',
    allowHeadless: optionalEnv('ALLOW_HEADLESS') === 'true',
    sdkScriptPath: resolve(requiredEnv('SDK_SCRIPT_PATH')),
    liveWindowMs: Number(optionalEnv('LIVE_WINDOW_MS') ?? 5 * 60_000),
    sessionGapMs: Number(optionalEnv('SESSION_GAP_MS') ?? 30 * 60_000),
    ingestConcurrency: Number(optionalEnv('INGEST_CONCURRENCY') ?? 4)
} as const;

configure({
    name: 'condor',
    jwtSecret: config.jwtSecret,
    redis: config.redis,
    storage: config.storage
});
