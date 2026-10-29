import { logger } from '@readable/utils/Logger';
import { LiveFlush } from '../contracts/domain/throttle';

const FLUSH_INTERVAL_MS = 1000;

export default class LiveThrottle{
    #flush: LiveFlush;
    #pending = new Map<string, Set<string>>();
    #timers = new Map<string, NodeJS.Timeout>();
    #flushedAt = new Map<string, number>();

    constructor(flush: LiveFlush){
        this.#flush = flush;
    }

    mark(projectId: string, sessionId: string | null){
        const pending = this.#pending.get(projectId) ?? new Set<string>();
        if(sessionId !== null) pending.add(sessionId);
        this.#pending.set(projectId, pending);
        if(this.#timers.has(projectId)) return;

        const wait = Math.max(0, (this.#flushedAt.get(projectId) ?? 0) + FLUSH_INTERVAL_MS - Date.now());
        this.#timers.set(projectId, setTimeout(() => void this.#run(projectId), wait).unref());
    }

    async #run(projectId: string){
        const sessionIds = [...this.#pending.get(projectId) ?? []];
        this.#pending.delete(projectId);
        this.#timers.delete(projectId);
        this.#flushedAt.set(projectId, Date.now());

        try{
            await this.#flush(projectId, sessionIds);
        }catch(error){
            logger.error('Live::FlushFailed', error, { scope: 'live', projectId });
        }
    }
}
