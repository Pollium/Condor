import websocket from '@fastify/websocket';
import Application from '@pollium/readable/app/Application';
import { createDataSource } from '@pollium/readable/database/data-source';
import { discoverFrom } from '@pollium/readable/app/discovery';
import { config } from '@/shared/config';
import { registerJsonBody } from './json-body';

const createApp = () => new Application({
    port: config.port,
    corsOrigins: [...config.corsOrigins],
    publicPaths: ['/i/'],
    log: config.log,
    discover: () => discoverFrom(import.meta.url, (url) => import(url)),
    createDataSource: (entities) => createDataSource(config.database, entities),
    plugins: async (app) => {
        await registerJsonBody(app);
        await app.register(websocket);
    }
});

export default createApp;
