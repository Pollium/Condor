import type { WireBatch, WireEvent } from '@condor/contracts/ingest/wire';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import type { CondorOptions, IdentifyInput, TrackInput } from './types.js';
import { VERSION } from './version.js';

const MAX_BATCH = 500;
const DEFAULT_FLUSH_AT = 50;
const DEFAULT_INTERVAL_MS = 2000;
const DEFAULT_RETRIES = 3;
const BACKOFF_MS = 500;

class DeliveryError extends Error{
    constructor(readonly status: number){
        super(`Condor answered ${status}`);
    }
}

const stampOf = (timestamp: Date | number | undefined): number =>
    timestamp instanceof Date ? timestamp.getTime() : timestamp ?? Date.now();

export class Condor{
    #options: Required<Omit<CondorOptions, 'release' | 'onError'>> & Pick<CondorOptions, 'release' | 'onError'>;
    #queue = new Map<string, WireEvent[]>();
    #size = 0;
    #timer: NodeJS.Timeout;
    #inflight = new Set<Promise<void>>();

    constructor(options: CondorOptions){
        this.#options = {
            flushAt: DEFAULT_FLUSH_AT,
            flushIntervalMs: DEFAULT_INTERVAL_MS,
            maxRetries: DEFAULT_RETRIES,
            fetch: globalThis.fetch,
            ...options,
            host: options.host.replace(/\/+$/, '')
        };
        this.#timer = setInterval(() => void this.flush(), this.#options.flushIntervalMs);
        this.#timer.unref();
    }

    track({ userId, name, props, timestamp, path = '/' }: TrackInput){
        this.#push(userId, { type: 'custom', id: randomUUID(), timestamp: stampOf(timestamp), path, name, ...(props ? { props } : {}) });
    }

    identify({ userId, traits, timestamp }: IdentifyInput){
        this.#push(userId, { type: 'identify', id: randomUUID(), timestamp: stampOf(timestamp), path: '/', userId, ...(traits ? { traits } : {}) });
    }

    async flush(): Promise<void>{
        const batches = [...this.#queue.entries()];
        this.#queue.clear();
        this.#size = 0;

        const sending = Promise.all(batches.flatMap(([userId, events]) => this.#chunks(events).map((chunk) => this.#deliver(userId, chunk))))
            .then(() => undefined);
        this.#inflight.add(sending);
        await sending.finally(() => this.#inflight.delete(sending));
    }

    async shutdown(): Promise<void>{
        clearInterval(this.#timer);
        await this.flush();
        await Promise.all(this.#inflight);
    }

    #push(userId: string, event: WireEvent){
        const events = this.#queue.get(userId) ?? [];
        events.push(event);
        this.#queue.set(userId, events);
        this.#size += 1;
        if(this.#size >= this.#options.flushAt) void this.flush();
    }

    #chunks(events: WireEvent[]): WireEvent[][]{
        const chunks: WireEvent[][] = [];
        for(let start = 0; start < events.length; start += MAX_BATCH) chunks.push(events.slice(start, start + MAX_BATCH));
        return chunks;
    }

    async #deliver(userId: string, events: WireEvent[]): Promise<void>{
        const batch: WireBatch = {
            key: this.#options.key,
            sdk: { name: 'condor-node', version: VERSION },
            sentAt: Date.now(),
            anonymousId: userId,
            userId,
            context: this.#options.release ? { release: this.#options.release } : {},
            events
        };

        for(let attempt = 0; ; attempt += 1){
            try{
                const res = await this.#options.fetch(`${this.#options.host}/i/batch`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ ...batch, sentAt: Date.now() })
                });
                if(res.ok) return;
                if(res.status < 500 && res.status !== 429) throw new DeliveryError(res.status);
                if(attempt >= this.#options.maxRetries) throw new DeliveryError(res.status);
            }catch(error){
                if(error instanceof DeliveryError || attempt >= this.#options.maxRetries){
                    this.#options.onError?.(error instanceof Error ? error : new Error(String(error)));
                    return;
                }
            }
            await sleep(BACKOFF_MS * 2 ** attempt);
        }
    }
}

export const createCondor = (options: CondorOptions): Condor => new Condor(options);
