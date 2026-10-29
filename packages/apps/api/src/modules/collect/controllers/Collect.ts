import CollectService from '../services/Collect';
import BaseController from '@readable/controllers/BaseController';
import { Controller } from '@readable/decorators/controllers/Controller';
import { Body, Query, Reply, Req } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { RateLimit } from '@readable/decorators/middleware/RateLimit';
import { ingestRoutes } from '@condor/contracts/ingest/routes';
import { WireBatch, WireReplayChunk } from '@condor/contracts/ingest/wire';
import { FastifyReply, FastifyRequest } from 'fastify';

const BATCH_BODY_LIMIT = 1024 * 1024;
const REPLAY_BODY_LIMIT = 5 * 1024 * 1024;
const SCRIPT_CACHE_CONTROL = 'public, max-age=300';

@Controller('')
export default class CollectController extends BaseController{
    #service = new CollectService();

    @Route(ingestRoutes.config)
    @RateLimit({ max: 600, window: '1m' })
    config(@Query('key') key: string | undefined){
        return this.#service.remoteConfig(key);
    }

    @Route(ingestRoutes.batch, { bodyLimit: BATCH_BODY_LIMIT })
    @RateLimit({ max: 1200, window: '1m' })
    batch(@Body() body: WireBatch, @Req() req: FastifyRequest){
        return this.#service.batch(body, req);
    }

    @Route(ingestRoutes.replay, { bodyLimit: REPLAY_BODY_LIMIT })
    @RateLimit({ max: 600, window: '1m' })
    replay(@Body() body: WireReplayChunk){
        return this.#service.replay(body);
    }

    @Route(ingestRoutes.script)
    async script(@Reply() reply: FastifyReply){
        const script = await this.#service.script();
        reply.header('cache-control', SCRIPT_CACHE_CONTROL);
        return script;
    }
}
