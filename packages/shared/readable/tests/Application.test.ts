import Application from '../lib/http/Application';
import ModuleDiscovery from '../lib/services/ModuleDiscovery';
import { createDataSource } from '../lib/http/data-source';
import { afterAll, describe, expect, it } from 'vitest';

interface ClientAddress{
    ip: string;
}

const DATABASE_URL = 'postgres://condor:condor@localhost:5442/condor';
const VISITOR = '203.0.113.7';
const FORGED = '192.0.2.1';
const NGINX = '172.18.0.4';
const INGRESS = '10.0.3.2';
const DIRECT_CLIENT = '198.51.100.9';
const CONSOLE = 'https://condor.example.com';
const CUSTOMER_SITE = 'https://shop.example.org';

const application = new Application({
    port: 0,
    corsOrigins: [CONSOLE],
    publicPaths: ['/i/'],
    log: { level: 'silent', pretty: false },
    discover: async () => ModuleDiscovery.merge([]),
    createDataSource: (entities) => createDataSource({ url: DATABASE_URL, schema: undefined, synchronize: false }, entities)
});

const app = await application.build({ queues: false });
app.get('/client', (req) => ({ ip: req.ip }));
app.post('/i/batch', () => ({ ok: true }));
app.post('/projects', () => ({ ok: true }));

const preflight = (url: string, origin: string) => app.inject({
    method: 'OPTIONS',
    url,
    headers: { origin, 'access-control-request-method': 'POST' }
});

const clientOf = async (remoteAddress: string, forwardedFor: string): Promise<string> => {
    const res = await app.inject({
        method: 'GET',
        url: '/client',
        remoteAddress,
        headers: { 'x-forwarded-for': forwardedFor }
    });

    return res.json<ClientAddress>().ip;
};

afterAll(() => application.stop());

describe('Application client address', () => {
    it('reads the visitor a proxy on the private network forwarded', async () => {
        await expect(clientOf(NGINX, VISITOR)).resolves.toBe(VISITOR);
    });

    it('walks back through every private hop and stops at the first public one', async () => {
        await expect(clientOf(NGINX, `${FORGED}, ${VISITOR}, ${INGRESS}`)).resolves.toBe(VISITOR);
    });

    it('ignores the forwarded address of a client that connects directly', async () => {
        await expect(clientOf(DIRECT_CLIENT, VISITOR)).resolves.toBe(DIRECT_CLIENT);
    });
});

describe('Application CORS', () => {
    it('lets any site post to a public path, without credentials', async () => {
        const res = await preflight('/i/batch', CUSTOMER_SITE);

        expect(res.headers['access-control-allow-origin']).toBe(CUSTOMER_SITE);
        expect(res.headers['access-control-allow-credentials']).toBeUndefined();
    });

    it('keeps every other path to the configured origins', async () => {
        const foreign = await preflight('/projects', CUSTOMER_SITE);
        const own = await preflight('/projects', CONSOLE);

        expect(foreign.headers['access-control-allow-origin']).toBeUndefined();
        expect(own.headers['access-control-allow-origin']).toBe(CONSOLE);
        expect(own.headers['access-control-allow-credentials']).toBe('true');
    });
});
