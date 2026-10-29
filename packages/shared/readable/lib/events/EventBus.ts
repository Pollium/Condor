import { createRedis } from '../redis/RedisClient';
import { logger } from '../utils/Logger';
import { Redis } from 'ioredis';
import { randomBytes } from 'node:crypto';

type Handler = (payload: unknown) => unknown;

const CHANNEL = 'condor:events';
const origin = randomBytes(8).toString('hex');

interface Envelope{
    origin: string;
    event: string;
    payload: unknown;
}

class EventBus{
    #handlers = new Map<string, Handler[]>();
    #inFlight = new Set<Promise<unknown>>();
    #publisher?: Redis;
    #subscriber?: Redis;
    #remote = process.env.VITEST === undefined;

    subscribe(event: string, handler: Handler){
        const handlers = this.#handlers.get(event) ?? [];
        handlers.push(handler);
        this.#handlers.set(event, handlers);
        if(this.#remote) this.#listen();
    }

    on<K extends keyof EventMap & string>(event: K, handler: (payload: EventMap[K]) => unknown){
        this.subscribe(event, (payload) => handler(payload as EventMap[K]));
    }

    emit<K extends keyof EventMap>(event: K, payload: EventMap[K]){
        this.#dispatch(event, payload);
        if(!this.#remote) return;
        void this.#publish(event, payload);
    }

    async settled(){
        while(this.#inFlight.size > 0){
            await Promise.all(this.#inFlight);
        }
    }

    async close(){
        await this.#publisher?.quit();
        await this.#subscriber?.quit();
        this.#publisher = undefined;
        this.#subscriber = undefined;
    }

    #dispatch(event: string, payload: unknown){
        for(const handler of this.#handlers.get(event) ?? []){
            const work = Promise.resolve()
                .then(() => handler(payload))
                .catch((error: unknown) => {
                    logger.error(`EventBus::HandlerFailed:${event}`, error);
                });

            this.#inFlight.add(work);
            work.finally(() => this.#inFlight.delete(work));
        }
    }

    async #publish(event: string, payload: unknown){
        try{
            this.#publisher ??= this.#connect();
            const envelope: Envelope = { origin, event, payload };
            await this.#publisher.publish(CHANNEL, JSON.stringify(envelope));
        }catch(error){
            logger.error('EventBus::PublishFailed', error);
        }
    }

    #listen(){
        if(this.#subscriber) return;

        try{
            this.#subscriber = this.#connect();
        }catch{
            return;
        }

        void this.#subscriber.subscribe(CHANNEL);
        this.#subscriber.on('message', (_channel: string, message: string) => {
            let envelope: Envelope;
            try{
                envelope = JSON.parse(message) as Envelope;
            }catch(error){
                logger.error('EventBus::InvalidEnvelope', error);
                return;
            }

            if(envelope.origin === origin) return;
            this.#dispatch(envelope.event, envelope.payload);
        });
    }

    #connect(): Redis{
        return createRedis();
    }
}

export const eventBus = new EventBus();
