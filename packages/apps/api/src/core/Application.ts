import websocket from '@fastify/websocket';
import Application from '@readable/http/Application';
import { createDataSource } from '@readable/http/data-source';
import { discoverFrom } from '@readable/http/discover';
import { config } from '@/shared/config';
import { registerJsonBody } from './json-body';

const createApp = () => new Application({
    port: config.port,
    corsOrigins: [...config.corsOrigins],
    publicPaths: ['/i/'],
    log: config.log,
    discover: () => discoverFrom(import.meta.url),
    createDataSource: (entities) => createDataSource(config.database, entities),
    plugins: async (app) => {
        await registerJsonBody(app);
        await app.register(websocket);
    }
});

export default createApp;
