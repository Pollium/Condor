import PaginatedResponse from './responses/Paginated';
import RawResponse from './responses/Raw';
import RedirectResponse from './responses/Redirect';
import { Handler } from '../contracts/routing';
import { getParamResolvers } from '../decorators/controllers/Params';
import { routesByController } from '../decorators/controllers/Route';
import { getStatus } from '../decorators/controllers/Status';
import { getMiddleware } from '../decorators/middleware/Middleware';
import { RouteError } from '../errors/Route';
import { FastifyInstance } from 'fastify';

export default abstract class BaseController{
    async register(app: FastifyInstance, prefix: string){
        const mount = async (scope: FastifyInstance) => {
            for(const route of routesByController.get(this.constructor)){
                const handler = this.#wrap(route);
                const middlewares = getMiddleware(this.constructor, route.handlerName);
                const url = route.absolute ? this.#relativeTo(route.path, prefix) : route.path;

                scope.route({
                    method: route.method,
                    url,
                    ...(route.bodyLimit === undefined ? {} : { bodyLimit: route.bodyLimit }),
                    preHandler: middlewares.map((mw) => async (req, reply) => await mw(req, reply)),
                    handler
                });
            }
        };

        if(prefix === ''){
            await mount(app);
            return;
        }

        await app.register(mount, { prefix });
    }

    #relativeTo(path: string, prefix: string){
        if(path !== prefix && !path.startsWith(`${prefix}/`)){
            throw RouteError.PrefixMismatch(path);
        }
        return path.slice(prefix.length) || '/';
    }

    #wrap(route: { handlerName: string | symbol; wrap: boolean }): Handler{
        const method = (Reflect.get(this, route.handlerName) as (...args: unknown[]) => unknown).bind(this);
        const override = getStatus(this.constructor, route.handlerName);
        const resolvers = getParamResolvers(this.constructor, route.handlerName);

        return async (req, reply) => {
            const boxes = await Promise.all(Array.from(resolvers, async (resolve) => {
                const arg = resolve === undefined ? undefined : resolve(req, reply);
                return { arg: arg instanceof Promise ? await arg : arg };
            }));
            const result = await method(...boxes.map((box) => box.arg));

            if(reply.sent) return;

            if(result instanceof RawResponse){
                return reply
                    .status(override ?? result.status)
                    .type(result.contentType)
                    .send(result.body);
            }

            if(result instanceof RedirectResponse){
                return reply.redirect(result.url, result.status);
            }

            if(result instanceof PaginatedResponse){
                return reply
                    .status(override ?? 200)
                    .send({
                        data: result.items,
                        meta: result.meta
                    });
            }

            if(result === undefined || result === null){
                return reply.status(override ?? 204).send();
            }

            if(!route.wrap){
                return reply.status(override ?? 200).send(result);
            }

            return reply.status(override ?? 200).send({ data: result });
        };
    }
}
