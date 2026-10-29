import { FastifyReply, FastifyRequest } from 'fastify';

export type MiddlewareFn = (
    req: FastifyRequest, 
    reply: FastifyReply
) => void | Promise<void>;

export interface MiddlewareBinding{
    handlerName: string | symbol | null;
    middleware: MiddlewareFn;
}