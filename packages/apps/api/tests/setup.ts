import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { vi } from 'vitest';

const databaseUrl = 'postgres://condor:condor@localhost:5442/condor';
const pool = (process.env.VITEST_POOL_ID ?? '1').replace(/\W/g, '');
const schema = `api_test_${pool}`;

Object.assign(process.env, {
    PORT: '4100',
    DATABASE_URL: databaseUrl,
    DATABASE_SCHEMA: schema,
    CORS_ORIGIN: 'http://localhost:5190',
    LOG_LEVEL: 'silent',
    LOG_PRETTY: 'false',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6389',
    JWT_SECRET: 'api-test-secret',
    STORAGE_ENDPOINT: 'http://storage.test',
    STORAGE_ACCESS_KEY: 'test',
    STORAGE_SECRET_KEY: 'test',
    STORAGE_BUCKET: 'condor-test',
    STORAGE_PUBLIC_URL: 'http://storage.test/condor-test',
    GEOIP_DATABASE: '',
    TRUST_GEO_HEADERS: 'true',
    ALLOW_HEADLESS: 'false',
    SDK_SCRIPT_PATH: join(tmpdir(), `condor-api-${pool}`, 'condor.js')
});

const { Client } = await import('pg');
const client = new Client({ connectionString: databaseUrl });
await client.connect();
await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
await client.query(`CREATE SCHEMA "${schema}"`);
await client.end();

const { default: BaseQueue } = await import('@readable/queues/BaseQueue');
const { default: QueueProducer } = await import('@readable/queues/QueueProducer');
const { rateLimitStore } = await import('@readable/decorators/middleware/RateLimit');

vi.spyOn(rateLimitStore, 'hit').mockResolvedValue({ count: 1, resetMs: 60_000 });
vi.spyOn(BaseQueue.prototype, 'add').mockResolvedValue();
vi.spyOn(QueueProducer.prototype, 'add').mockResolvedValue();
