import { projectDirectory } from '../services/ProjectDirectory';
import { IngestError } from '../contracts/domain/errors';
import QueueProducer from '@readable/queues/QueueProducer';
import { objectStorage } from '@readable/storage/ObjectStorage';
import { replayStorageKey } from '@/modules/tracking/contracts/domain/queue';
import { WireClick, WirePageview } from '@condor/contracts/ingest/wire';
import { config } from '@/shared/config';
import { ingestProject, PROJECT_ID, PUBLIC_KEY } from '@tests/fixtures';
import { useApp } from '@tests/harness';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const RECEIVED_AT = 1_790_000_000_000;
const SENT_AT = RECEIVED_AT - 5_000;
const SESSION_ID = '0196f1b2-aaaa-7e5f-8a9b-0c1d2e3f4a5b';
const DESKTOP_CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const PAGEVIEW: WirePageview = {
    type: 'pageview',
    id: '0196f1b2-0001-7e5f-8a9b-0c1d2e3f4a5b',
    timestamp: SENT_AT - 1_000,
    path: '/products/blue-shoes?color=blue',
    title: 'Blue shoes',
    referrer: 'https://www.google.com/'
};

const CLICK: WireClick = {
    type: 'click',
    id: '0196f1b2-0002-7e5f-8a9b-0c1d2e3f4a5b',
    timestamp: SENT_AT - 500,
    path: '/orders/12345',
    x: 120,
    y: 480,
    viewportWidth: 1280,
    documentHeight: 3200,
    selector: 'button.buy',
    rage: false,
    dead: false
};

const REPLAY_EVENTS = [
    { type: 4, timestamp: SENT_AT - 3_000, data: { href: 'https://shop.example.com/' } },
    { type: 2, timestamp: SENT_AT - 2_990, data: { node: {} } },
    { type: 3, timestamp: SENT_AT - 100, data: { source: 1 } }
];

const batchOf = (events: unknown[], overrides: Record<string, unknown> = {}) => ({
    key: PUBLIC_KEY,
    sdk: { name: 'condor-browser', version: '0.1.0' },
    sentAt: SENT_AT,
    anonymousId: 'anon-1',
    sessionId: SESSION_ID,
    context: { language: 'es-CL', timezone: 'America/Santiago', screenWidth: 1920, screenHeight: 1080, viewportWidth: 1280, viewportHeight: 720 },
    events,
    ...overrides
});

const replayOf = (overrides: Record<string, unknown> = {}) => ({
    key: PUBLIC_KEY,
    sessionId: SESSION_ID,
    seq: 3,
    sentAt: SENT_AT,
    events: REPLAY_EVENTS,
    ...overrides
});

describe('CollectController', () => {
    const ctx = useApp();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(RECEIVED_AT);
    const resolve = vi.spyOn(projectDirectory, 'resolve');
    const enqueue = vi.spyOn(QueueProducer.prototype, 'add');
    const put = vi.spyOn(objectStorage, 'put');

    const send = (url: string, payload: unknown, headers: Record<string, string> = {}) => ctx.app.inject({
        method: 'POST',
        url,
        headers: {
            'content-type': 'text/plain;charset=UTF-8',
            'user-agent': DESKTOP_CHROME,
            origin: 'https://shop.example.com',
            ...headers
        },
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload)
    });

    beforeEach(() => {
        resolve.mockReset().mockImplementation(async (key) => {
            if(key === PUBLIC_KEY) return ingestProject();
            throw IngestError.UnknownKey();
        });
        enqueue.mockReset().mockResolvedValue();
        put.mockReset().mockResolvedValue();
    });
    afterAll(() => {
        clock.mockRestore();
    });

    describe('GET /i/config', () => {
        it('returns the remote config of the project', async () => {
            const res = await ctx.app.inject({ method: 'GET', url: `/i/config?key=${PUBLIC_KEY}` });

            expect(res.statusCode).toBe(200);
            expect(res.json()).toEqual({
                data: {
                    projectId: PROJECT_ID,
                    respectDnt: true,
                    recording: {
                        enabled: true,
                        sampleRate: 1,
                        maskInputs: true,
                        maskText: false,
                        blockSelector: null,
                        captureConsole: true,
                        captureNetwork: false
                    }
                }
            });
        });

        it('rejects an unknown or missing key', async () => {
            const unknown = await ctx.app.inject({ method: 'GET', url: '/i/config?key=pk_nope' });
            const missing = await ctx.app.inject({ method: 'GET', url: '/i/config' });

            expect(unknown.statusCode).toBe(401);
            expect(unknown.json()).toEqual({ error: 'Ingest::UnknownKey' });
            expect(missing.statusCode).toBe(401);
        });
    });

    describe('POST /i/batch', () => {
        it('enqueues an enriched batch with the clock skew applied', async () => {
            const res = await send('/i/batch', batchOf([PAGEVIEW, CLICK]), { 'cf-ipcountry': 'CL', 'x-geo-city': 'Santiago' });

            expect(res.statusCode).toBe(200);
            expect(res.json()).toEqual({ data: { accepted: 2 } });
            expect(enqueue).toHaveBeenCalledExactlyOnceWith({
                projectId: PROJECT_ID,
                receivedAt: RECEIVED_AT,
                anonymousId: 'anon-1',
                userId: null,
                sessionId: SESSION_ID,
                sdk: 'condor-browser@0.1.0',
                context: {
                    country: 'CL',
                    region: null,
                    city: 'Santiago',
                    os: 'Windows',
                    osVersion: 'NT 10.0',
                    browser: 'Chrome',
                    browserVersion: '130.0.0.0',
                    device: 'desktop',
                    language: 'es-CL',
                    timezone: 'America/Santiago',
                    screenWidth: 1920,
                    screenHeight: 1080,
                    viewportWidth: 1280,
                    connection: null,
                    release: null
                },
                events: [
                    {
                        ...PAGEVIEW,
                        timestamp: PAGEVIEW.timestamp + 5_000,
                        path: '/products/:slug',
                        rawPath: '/products/blue-shoes',
                        attribution: {
                            channel: 'organic',
                            source: 'Google',
                            referrer: 'https://www.google.com/',
                            referrerHost: 'google.com',
                            utmSource: null,
                            utmMedium: null,
                            utmCampaign: null,
                            utmContent: null,
                            utmTerm: null
                        }
                    },
                    { ...CLICK, timestamp: CLICK.timestamp + 5_000, path: '/orders/:id', rawPath: '/orders/12345' }
                ]
            });
        });

        it('groups failed requests by route so one broken endpoint is one issue', async () => {
            const failure = (path: string) => ({
                type: 'error' as const,
                id: crypto.randomUUID(),
                timestamp: PAGEVIEW.timestamp,
                path: '/products/blue-shoes',
                errorType: 'Network',
                message: `GET ${path} → 500`
            });
            await send('/i/batch', batchOf([failure('/products/red-boots'), failure('https://api.shop.test/orders/12345')]));

            const [job] = enqueue.mock.calls[0] as [{ events: Array<{ message?: string }> }];
            expect(job.events.map((event) => event.message)).toEqual([
                'GET /products/:slug → 500',
                'GET https://api.shop.test/orders/:id → 500'
            ]);
        });

        it('leaves an internal navigation unattributed', async () => {
            await send('/i/batch', batchOf([{ ...PAGEVIEW, referrer: 'https://shop.example.com/' }]));

            expect(enqueue.mock.calls[0]![0]).toMatchObject({ events: [{ path: '/products/:slug' }] });
            expect(enqueue.mock.calls[0]![0]).not.toHaveProperty('events.0.attribution');
        });

        it('accepts application/json too', async () => {
            const res = await send('/i/batch', batchOf([CLICK]), { 'content-type': 'application/json' });

            expect(res.json()).toEqual({ data: { accepted: 1 } });
            expect(enqueue).toHaveBeenCalledOnce();
        });

        it('rejects a body that is not JSON or not a batch', async () => {
            const broken = await send('/i/batch', '{"key":');
            const invalid = await send('/i/batch', batchOf([CLICK], { anonymousId: '' }));

            expect(broken.statusCode).toBe(400);
            expect(broken.json()).toEqual({ error: 'Ingest::MalformedPayload' });
            expect(invalid.statusCode).toBe(400);
            expect(invalid.json()).toMatchObject({ error: 'Request::ValidationFailed' });
            expect(enqueue).not.toHaveBeenCalled();
        });

        it('rejects a body over the batch limit', async () => {
            const res = await send('/i/batch', batchOf([{ ...CLICK, text: 'x'.repeat(1_100_000) }]));

            expect(res.statusCode).toBe(413);
            expect(res.json()).toEqual({ error: 'Ingest::PayloadTooLarge' });
        });

        it('rejects an unknown key', async () => {
            const res = await send('/i/batch', batchOf([CLICK], { key: 'pk_nope' }));

            expect(res.statusCode).toBe(401);
            expect(res.json()).toEqual({ error: 'Ingest::UnknownKey' });
        });

        it('drops a bot without enqueuing', async () => {
            const res = await send('/i/batch', batchOf([PAGEVIEW]), { 'user-agent': GOOGLEBOT });

            expect(res.json()).toEqual({ data: { accepted: 0 } });
            expect(enqueue).not.toHaveBeenCalled();
        });

        it('takes a server batch whatever client the server uses', async () => {
            const custom = { type: 'custom', id: '0196f1b2-0003-7e5f-8a9b-0c1d2e3f4a5b', timestamp: SENT_AT - 100, path: '/', name: 'course_generated' };
            const res = await send('/i/batch', batchOf([custom], { sessionId: undefined, anonymousId: 'user-7', userId: 'user-7', context: {} }), {
                'user-agent': 'python-requests/2.32.3',
                'content-type': 'application/json'
            });

            expect(res.json()).toEqual({ data: { accepted: 1 } });
            expect(enqueue).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ sessionId: null, userId: 'user-7' }));
        });

        it('enqueues a heartbeat with no events', async () => {
            const res = await send('/i/batch', batchOf([], { userId: 'user-7' }));

            expect(res.json()).toEqual({ data: { accepted: 0 } });
            expect(enqueue).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ userId: 'user-7', events: [] }));
        });
    });

    describe('POST /i/replay', () => {
        it('stores the chunk gzipped and enqueues it', async () => {
            const res = await send('/i/replay', replayOf());
            const storageKey = replayStorageKey(PROJECT_ID, SESSION_ID, 3);
            const stored = put.mock.calls[0]![1] as Buffer;

            expect(res.json()).toEqual({ data: { accepted: 3 } });
            expect(put).toHaveBeenCalledExactlyOnceWith(storageKey, expect.any(Buffer), 'application/json');
            expect(JSON.parse(gunzipSync(stored).toString('utf8'))).toEqual(REPLAY_EVENTS);
            expect(enqueue).toHaveBeenCalledExactlyOnceWith({
                projectId: PROJECT_ID,
                sessionId: SESSION_ID,
                seq: 3,
                storageKey,
                size: stored.length,
                eventCount: 3,
                firstTimestamp: SENT_AT - 3_000 + 5_000,
                lastTimestamp: SENT_AT - 100 + 5_000,
                hasFullSnapshot: true,
                receivedAt: RECEIVED_AT
            });
        });

        it('notes a chunk without a full snapshot', async () => {
            await send('/i/replay', replayOf({ events: [REPLAY_EVENTS[2]] }));

            expect(enqueue).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ hasFullSnapshot: false, eventCount: 1 }));
        });

        it('refuses a project that does not record', async () => {
            resolve.mockResolvedValueOnce(ingestProject({ recordingEnabled: false }));

            const res = await send('/i/replay', replayOf());

            expect(res.statusCode).toBe(403);
            expect(res.json()).toEqual({ error: 'Ingest::Disabled' });
            expect(put).not.toHaveBeenCalled();
            expect(enqueue).not.toHaveBeenCalled();
        });
    });

    describe('GET /i/condor.js', () => {
        it('serves the SDK bundle with a short public cache', async () => {
            await mkdir(dirname(config.sdkScriptPath), { recursive: true });
            await writeFile(config.sdkScriptPath, 'window.condor=1;');

            const res = await ctx.app.inject({ method: 'GET', url: '/i/condor.js' });

            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toBe('application/javascript; charset=utf-8');
            expect(res.headers['cache-control']).toBe('public, max-age=300');
            expect(res.body).toBe('window.condor=1;');
        });

        it('answers 404 while the bundle is missing', async () => {
            await rm(config.sdkScriptPath, { force: true });

            const res = await ctx.app.inject({ method: 'GET', url: '/i/condor.js' });

            expect(res.statusCode).toBe(404);
            expect(res.json()).toEqual({ error: 'Script::Missing' });
        });
    });
});
