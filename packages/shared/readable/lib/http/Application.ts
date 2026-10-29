import cors from '@fastify/cors';
import RuntimeError from '../errors/RuntimeError';
import ValidationError from '../errors/Validation';
import BaseGateway from '../gateway/BaseGateway';
import BaseQueue from '../queues/BaseQueue';
import HealthController from './HealthController';
import { ApiError } from '@condor/contracts/shared/http';
import { HttpMethod } from '@condor/contracts/shared/routing';
import { LogLevel } from '../contracts/logging';
import { broadcast } from '../events/Broadcast';
import { eventBus } from '../events/EventBus';
import { registerEventGroup } from '../events/register-event-group';
import { Discovered, MountedController } from '../services/ModuleDiscovery';
import { logger } from '../utils/Logger';
import Fastify, { LogController, FastifyInstance, FastifyBaseLogger, FastifyRequest } from 'fastify';
import { DataSource } from 'typeorm';

export interface BuildOptions{
    queues?: boolean;
}

export interface ApplicationLog{
    level: string;
    pretty: boolean;
}

export interface ApplicationOptions{
    port: number;
    corsOrigins: string[];
    publicPaths?: string[];
    log: ApplicationLog;
    discover: () => Promise<Discovered>;
    createDataSource?: (entities: Function[]) => DataSource;
    plugins?: (app: FastifyInstance) => Promise<void>;
    afterDatabase?: (dataSource: DataSource) => Promise<void>;
    afterMount?: (discovered: Discovered) => void;
}

const CORS_METHODS: HttpMethod[] = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'];
const PRIVATE_NETWORKS = ['loopback', 'linklocal', 'uniquelocal'];
const PUBLIC_CORS = { origin: true, credentials: false, methods: CORS_METHODS };
const PRIVATE_CORS = { credentials: true, methods: CORS_METHODS };

export default class Application{
    #app!: FastifyInstance;
    #dataSource?: DataSource;
    #queues: BaseQueue<unknown>[] = [];
    #options: ApplicationOptions;

    constructor(options: ApplicationOptions){
        this.#options = options;
    }

    get dataSource(): DataSource | undefined{
        return this.#dataSource;
    }

    async build({ queues: startQueues = true }: BuildOptions = {}): Promise<FastifyInstance>{
        logger.configure({
            level: this.#options.log.level as LogLevel,
            pretty: this.#options.log.pretty
        });
        this.#app = Fastify({
            loggerInstance: logger.raw as FastifyBaseLogger,
            logController: new LogController({ disableRequestLogging: true }),
            trustProxy: PRIVATE_NETWORKS
        });

        await this.#app.register(cors, {
            delegator: (req: FastifyRequest, resolve: (error: null, options: object) => void) => {
                resolve(null, this.#isPublic(req.url) ? PUBLIC_CORS : { ...PRIVATE_CORS, origin: this.#options.corsOrigins });
            }
        });
        if(this.#options.plugins) await this.#options.plugins(this.#app);

        const discovered = await this.#options.discover();

        if(this.#options.createDataSource){
            this.#dataSource = this.#options.createDataSource(discovered.entities);
            await this.#dataSource.initialize();
            if(this.#options.afterDatabase) await this.#options.afterDatabase(this.#dataSource);
        }

        this.#registerErrorHandler();
        this.#registerRequestLogging();
        await this.#mountControllers(discovered.controllers);
        await new HealthController().register(this.#app, '');
        this.#mountGateways(discovered.gateways);
        discovered.events.forEach(registerEventGroup);
        this.#options.afterMount?.(discovered);
        if(startQueues) this.#startQueues(discovered.queues);

        return this.#app;
    }

    async start(){
        await this.build();
        await this.#app.listen({ port: this.#options.port, host: '0.0.0.0' });
    }

    async stop(){
        await this.#app.close();
        await Promise.all(this.#queues.map((queue) => queue.close()));
        await eventBus.close();
        await broadcast.close();
        await this.#dataSource?.destroy();
    }

    #isPublic(url: string): boolean{
        return this.#options.publicPaths?.some((prefix) => url.startsWith(prefix)) ?? false;
    }

    #registerErrorHandler(){
        this.#app.setErrorHandler((err, req, reply) => {
            const status = err instanceof RuntimeError ? err.statusCode : 500;
            const message = err instanceof Error ? err.message : 'Internal Server Error';

            if(status >= 500){
                logger.error(`${req.method} ${req.url}`, err, { scope: 'http', statusCode: status });
            }

            const payload: ApiError = { error: message };
            if(err instanceof ValidationError) payload.errors = err.errors;

            reply.status(status).send(payload);
        });
    }

    #registerRequestLogging(){
        this.#app.addHook('onResponse', (req, reply, done) => {
            logger.debug(`${req.method} ${req.url}`, {
                scope: 'http',
                statusCode: reply.statusCode,
                ms: Math.round(reply.elapsedTime)
            });
            done();
        });
    }

    async #mountControllers(controllers: MountedController[]){
        for(const { prefix, Controller } of controllers){
            await new Controller().register(this.#app, prefix);
        }
    }

    #mountGateways(gateways: Array<new () => BaseGateway>){
        for(const Gateway of gateways){
            new Gateway().register(this.#app);
        }
    }

    #startQueues(queues: Array<new () => BaseQueue<unknown>>){
        for(const Queue of queues){
            const queue = new Queue();
            queue.startWorker();
            this.#queues.push(queue);
        }
    }
}
