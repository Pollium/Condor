import { record } from '@rrweb/record';
import { RemoteRecording } from '@condor/contracts/ingest/config';
import { WireReplayChunk } from '@condor/contracts/ingest/wire';
import Identity from './identity';
import Transport, { Outcome } from './transport';

const FLUSH_EVERY_MS = 5_000;
const FLUSH_AT_BYTES = 200_000;
const CHECKOUT_EVERY_MS = 5 * 60_000;

export interface RecorderOptions{
    key: string;
    endpoint: string;
}

export default class Recorder{
    #stop: (() => void) | null = null;
    #buffer: unknown[] = [];
    #bytes = 0;
    #timer: ReturnType<typeof setInterval> | null = null;
    #settings: RemoteRecording | null = null;

    constructor(
        private readonly options: RecorderOptions,
        private readonly identity: Identity,
        private readonly transport: Transport,
        private readonly onOutcome: (outcome: Outcome) => void
    ){}

    get active(): boolean{
        return this.#stop !== null;
    }

    start(settings: RemoteRecording){
        this.#settings = settings;
        if(!settings.enabled || !this.identity.sample(settings.sampleRate)) return;

        this.#stop = record({
            emit: (event) => this.#collect(event),
            maskAllInputs: settings.maskInputs,
            ...(settings.maskText ? { maskTextSelector: '*' } : {}),
            blockSelector: ['[data-condor-block]', settings.blockSelector].filter(Boolean).join(', '),
            maskTextClass: 'condor-mask',
            sampling: { mousemove: 50, scroll: 150, input: 'last' },
            checkoutEveryNms: CHECKOUT_EVERY_MS,
            inlineStylesheet: true,
            collectFonts: false
        }) ?? null;
        this.#timer ??= setInterval(() => this.flush(), FLUSH_EVERY_MS);
    }

    restart(){
        this.flush();
        this.stop();
        if(this.#settings !== null) this.start(this.#settings);
    }

    stop(){
        this.#stop?.();
        this.#stop = null;
        if(this.#timer !== null) clearInterval(this.#timer);
        this.#timer = null;
    }

    custom(tag: string, payload: unknown){
        if(this.#stop === null) return;
        record.addCustomEvent(tag, payload);
    }

    flush(beacon = false){
        if(this.#buffer.length === 0) return;
        const chunk: WireReplayChunk = {
            key: this.options.key,
            sessionId: this.identity.session.id,
            seq: this.identity.nextSeq(),
            sentAt: Date.now(),
            events: this.#buffer
        };
        this.#buffer = [];
        this.#bytes = 0;

        if(beacon){
            this.transport.beacon(this.options.endpoint, chunk);
            return;
        }
        void this.transport.post(this.options.endpoint, chunk).then((outcome) => {
            if(outcome === 'disabled' || outcome === 'unknown-key') this.stop();
            this.onOutcome(outcome);
        });
    }

    #collect(event: unknown){
        this.#buffer.push(event);
        this.#bytes += JSON.stringify(event).length;
        if(this.#bytes >= FLUSH_AT_BYTES) this.flush();
    }
}
