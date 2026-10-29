import { WireBatch, WireEvent } from '@condor/contracts/ingest/wire';
import Identity from './identity';
import Transport, { Outcome } from './transport';
import { browserContext } from './context';
import { VERSION } from './version';

const FLUSH_EVERY_MS = 5_000;
const FLUSH_AT = 20;
const MAX_EVENTS = 500;

export interface QueueOptions{
    key: string;
    endpoint: string;
    release: string | undefined;
}

export default class EventQueue{
    #events: WireEvent[] = [];
    #sessionId: string | null = null;
    #timer: ReturnType<typeof setInterval> | null = null;
    #stopped = false;

    constructor(
        private readonly options: QueueOptions,
        private readonly identity: Identity,
        private readonly transport: Transport,
        private readonly onOutcome: (outcome: Outcome) => void
    ){}

    start(){
        this.#timer ??= setInterval(() => void this.flush(), FLUSH_EVERY_MS);
    }

    stop(){
        this.#stopped = true;
        this.#events = [];
        if(this.#timer !== null) clearInterval(this.#timer);
        this.#timer = null;
    }

    get size(): number{
        return this.#events.length;
    }

    push(event: WireEvent){
        if(this.#stopped) return;
        const sessionId = this.identity.session.id;
        if(this.#sessionId !== null && this.#sessionId !== sessionId) void this.flush();
        this.#sessionId = sessionId;
        this.#events.push(event);
        if(this.#events.length >= FLUSH_AT) void this.flush();
    }

    async flush(): Promise<void>{
        if(this.#stopped || this.#events.length === 0) return;
        const outcome = await this.transport.post(this.options.endpoint, this.#batch(this.#take()));
        this.onOutcome(outcome);
    }

    heartbeat(){
        if(this.#stopped) return;
        void this.transport.post(this.options.endpoint, this.#batch([])).then(this.onOutcome);
    }

    beacon(){
        if(this.#stopped || this.#events.length === 0) return;
        this.transport.beacon(this.options.endpoint, this.#batch(this.#take()));
    }

    #take(): WireEvent[]{
        return this.#events.splice(0, MAX_EVENTS);
    }

    #batch(events: WireEvent[]): WireBatch{
        const sessionId = events.length > 0 && this.#sessionId !== null ? this.#sessionId : this.identity.session.id;
        return {
            key: this.options.key,
            sdk: { name: 'condor-browser', version: VERSION },
            sentAt: Date.now(),
            anonymousId: this.identity.anonymousId,
            userId: this.identity.userId,
            sessionId,
            context: browserContext(this.options.release),
            events
        };
    }
}
