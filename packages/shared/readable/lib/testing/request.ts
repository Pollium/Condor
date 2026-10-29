import JWTService from '../auth/JWTService';
import { Endpoint, HttpMethod } from '@condor/contracts/shared/routing';
import { FastifyInstance } from 'fastify';
import { expect } from 'vitest';

type QueryParams = Record<string, number | string>;

export interface RequestOptions<I>{
    as?: string;
    body?: I;
    params?: QueryParams;
    query?: QueryParams;
    headers?: Record<string, string>;
}

export interface TestResponse<O>{
    status: number;
    body: string;
    json: <T = Record<string, unknown>>() => T;
    data: () => O;
}

export const authHeader = (userId: string): Record<string, string> => ({
    authorization: `Bearer ${new JWTService().sign(userId)}`
});

const withParams = (path: string, params: QueryParams): string => {
    let url = path;
    for(const [name, value] of Object.entries(params)){
        url = url.replace(`:${name}`, String(value));
    }
    return url;
};

const withQuery = (url: string, query?: QueryParams): string => {
    if(!query) return url;

    const search = new URLSearchParams();
    for(const [key, value] of Object.entries(query)){
        search.set(key, String(value));
    }
    return `${url}?${search}`;
};

export const request = async <I, O>(
    app: FastifyInstance,
    endpoint: Endpoint<I, O>,
    { as, body, params = {}, query, headers }: RequestOptions<I> = {}
): Promise<TestResponse<O>> => {
    const res = await app.inject({
        method: endpoint.method,
        url: withQuery(withParams(endpoint.path, params), query),
        headers: {
            ...headers,
            ...(as === undefined ? {} : authHeader(as))
        },
        payload: body as object | undefined
    });

    return {
        status: res.statusCode,
        body: res.body,
        json: <T>() => res.json() as T,
        data: () => (res.json() as { data: O }).data
    };
};

export const route = (method: HttpMethod, path: string): Endpoint<unknown, unknown> => ({ method, path });

export const expectError = (res: TestResponse<unknown>, status: number, code: string) => {
    expect(res.status).toBe(status);
    expect(res.json()).toMatchObject({ error: code });
};
