import { IngestError } from '@/modules/collect/contracts/domain/errors';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { IncomingMessage } from 'node:http';

const JSON_TYPES = ['text/plain', 'application/json'];

const readBody = (req: FastifyRequest, payload: IncomingMessage): Promise<Buffer> => {
    const limit = req.routeOptions.bodyLimit;
    if(Number(req.headers['content-length']) > limit) return Promise.reject(IngestError.PayloadTooLarge());

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let size = 0;

        const stop = (error: Error) => {
            payload.off('data', onData).off('end', onEnd).off('error', stop);
            reject(error);
        };
        const onData = (chunk: Buffer) => {
            size += chunk.length;
            if(size > limit) return stop(IngestError.PayloadTooLarge());
            chunks.push(chunk);
        };
        const onEnd = () => resolve(Buffer.concat(chunks));

        payload.on('data', onData).on('end', onEnd).on('error', stop);
    });
};

const parseJson = async (req: FastifyRequest, payload: IncomingMessage): Promise<unknown> => {
    const body = await readBody(req, payload);

    try{
        return JSON.parse(body.toString('utf8'));
    }catch{
        throw IngestError.MalformedPayload();
    }
};

export const registerJsonBody = async (app: FastifyInstance) => {
    app.removeContentTypeParser(JSON_TYPES);
    app.addContentTypeParser(JSON_TYPES, parseJson);
};
