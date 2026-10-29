import { FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export interface RouteDefinition{
    path: string;
    method: HttpMethod;
    handlerName: string | symbol;
    absolute: boolean;
    wrap: boolean;
    bodyLimit?: number;
}

export interface RouteOptions{
    method?: string;
    wrap?: boolean;
    bodyLimit?: number;
}

export interface StatusBinding{
    handlerName: string | symbol;
    code: number;
}

export type Handler = (
    req: FastifyRequest<RouteGenericInterface>,
    reply: FastifyReply
) => unknown;