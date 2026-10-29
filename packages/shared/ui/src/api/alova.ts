import adapterFetch from 'alova/fetch';
import ReactHook from 'alova/react';
import { env } from '../config/env';
import { ApiError } from '../services/ApiError';
import { answerOf, NETWORK_FAILED } from './answer';
import { requestAuth } from './request-auth';
import { createAlova } from 'alova';

export const createClient = (baseURL: string) => createAlova({
    baseURL,
    requestAdapter: adapterFetch(),
    statesHook: ReactHook,
    cacheFor: {
        GET: 30_000
    },

    beforeRequest(method){
        const isJson = method.data !== undefined && !(method.data instanceof FormData);

        method.config.headers['Content-Type'] = isJson ? 'application/json' : '';
        Object.assign(method.config.headers, requestAuth());
    },

    responded: {
        async onSuccess(response){
            const payload = response.status === 204
                ? undefined
                : await response.json().catch(() => undefined);

            return answerOf(response.status, response.statusText, payload);
        },

        onError(error){
            if(error instanceof ApiError) throw error;
            throw new ApiError(0, NETWORK_FAILED, undefined, { cause: error });
        }
    }
});

export const alova = createClient(env.apiUrl);
