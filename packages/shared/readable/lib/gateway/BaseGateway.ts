import RuntimeError from '../errors/RuntimeError';
import ConnectionsRegistry from './ConnectionRegistry';
import { InboundFrame, OutboundMessage } from '../contracts/gateway';
import { getParamResolvers } from '../decorators/controllers/Params';
import { channelByGateway } from '../decorators/gateway/Channel';
import { handlersByGateway } from '../decorators/gateway/Gateway';
import { getClassMiddleware } from '../decorators/middleware/Middleware';
import { GatewayError } from '../errors/Gateway';
import { abortScope } from '../services/AbortScope';
import { createContext } from './create-context';
import { WebSocket } from '@fastify/websocket';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default abstract class BaseGateway{
    protected readonly connections = new ConnectionsRegistry();
    
    #messageHandlers = new Map<string, string | symbol>();
    #connectHandlers: Array<string | symbol> = [];
    #disconnectHandlers: Array<string | symbol> = [];

    register(app: FastifyInstance){
        const path = channelByGateway.get(this.constructor);
        if(!path) throw GatewayError.MissingChannel();

        this.#indexHandlers();
        const guards = getClassMiddleware(this.constructor);

        app.get(path, {
            websocket: true,
            preValidation: guards.map((mw) => async (req: FastifyRequest, reply: FastifyReply) => {
                await mw(req, reply);
            })
        }, (socket, req) => this.#onConnection(socket, req));
    }

    #indexHandlers(){
        for(const handler of handlersByGateway.get(this.constructor)){
            const { kind, handlerName } = handler;
            if(kind === 'message'){
                this.#messageHandlers.set(handler.type, handlerName);
            }else if(kind === 'connect'){
                this.#connectHandlers.push(handlerName);
            }else{
                this.#disconnectHandlers.push(handlerName);
            }
        }
    }

    #onConnection(socket: WebSocket, req: FastifyRequest){
        const disconnected = new AbortController();
        this.connections.add(socket);

        for(const handlerName of this.#connectHandlers){
            this.#runLifecycle(handlerName, socket, req);
        }

        socket.on('message', (raw: Buffer) => {
            abortScope.run(disconnected.signal, () => this.#dispatch(socket, req, raw.toString()));
        });

        socket.on('close', () => {
            disconnected.abort();
            this.connections.remove(socket);

            for(const handlerName of this.#disconnectHandlers){
                this.#runLifecycle(handlerName, socket, req);
            }
        });
    }

    async #dispatch(socket: WebSocket, req: FastifyRequest, raw: string){
        const frame = this.#parseFrame(raw);
        if(!frame){
            this.#sendError(socket, GatewayError.MalformedFrame());
            return;
        }

        const handlerName = this.#messageHandlers.get(frame.type);
        if(handlerName === undefined){
            this.#sendError(socket, GatewayError.UnknownMessageType(), frame);
            return;
        }

        try{
            const result = await this.#invoke(handlerName, socket, req, frame);
            if(result !== undefined && result !== null){
                this.#send(socket, {
                    type: frame.type,
                    data: result
                });
            }
        }catch(error){
            if(abortScope.signal()?.aborted === true) return;
            this.#handleError(socket, error, frame);
        }
    }

    #parseFrame(raw: string): InboundFrame | undefined{
        try{
            const frame = JSON.parse(raw) as InboundFrame;
            return typeof frame?.type === 'string' ? frame : undefined;
        }catch{
            return undefined;
        }
    }

    async #runLifecycle(handlerName: string | symbol, socket: WebSocket, req: FastifyRequest){
        try{
            await this.#invoke(handlerName, socket, req, undefined);
        }catch(error){
            this.#handleError(socket, error);
        }
    }

    async #invoke(
        handlerName: string | symbol,
        socket: WebSocket,
        req: FastifyRequest,
        frame: InboundFrame | undefined
    ): Promise<unknown>{
        const ctx = createContext(req, socket, frame);
        const resolvers = getParamResolvers(this.constructor, handlerName);
        const args = await Promise.all(resolvers.map((resolve) => resolve(ctx)));

        // TODO: remove duplicated code
        const method = Reflect.get(this, handlerName) as (...args: unknown[]) => unknown;
        return method.apply(this, args);
    }

    #handleError(socket: WebSocket, error: unknown, frame?: InboundFrame){
        if(error instanceof RuntimeError){
            this.#sendError(socket, error, frame);
            return;
        }

        this.#sendError(socket, GatewayError.Internal(), frame);
    }

    #send(socket: WebSocket, message: OutboundMessage<unknown>){
        socket.send(JSON.stringify(message));
    }

    #sendError(socket: WebSocket, error: RuntimeError, frame?: InboundFrame){
        const sessionId = (frame === undefined) ? undefined : frame.sessionId;
        const scope = (typeof sessionId === 'string') ? { sessionId } : {};

        socket.send(JSON.stringify({
            error: error.message,
            ...scope
        }));
    }
}
