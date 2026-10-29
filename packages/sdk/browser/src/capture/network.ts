import { ReplayNetworkEntry } from '@condor/contracts/ingest/wire';
import Activity from './activity';

export interface NetworkSink{
    request: (entry: ReplayNetworkEntry) => void;
}

const urlOf = (input: RequestInfo | URL): string =>
    typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

export default class NetworkTracker{
    #restore: Array<() => void> = [];

    constructor(private readonly ownHost: string, private readonly activity: Activity, private readonly sink: NetworkSink){}

    start(){
        this.#wrapFetch();
        this.#wrapXhr();
    }

    stop(){
        for(const restore of this.#restore) restore();
        this.#restore = [];
    }

    #record(method: string, rawUrl: string, status: number, startedAt: number){
        const url = this.#clean(rawUrl);
        if(url === null) return;
        this.activity.request();
        this.sink.request({ method: method.toUpperCase(), url, status, durationMs: Math.round(performance.now() - startedAt), failed: status === 0 });
    }

    #clean(raw: string): string | null{
        try{
            const url = new URL(raw, window.location.href);
            if(url.origin === this.ownHost) return null;
            return url.origin === window.location.origin ? url.pathname : `${url.origin}${url.pathname}`;
        }catch{
            return null;
        }
    }

    #wrapFetch(){
        if(typeof window.fetch !== 'function') return;
        const original = window.fetch;
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            const startedAt = performance.now();
            const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
            try{
                const response = await original.call(window, input, init);
                this.#record(method, urlOf(input), response.status, startedAt);
                return response;
            }catch(error){
                this.#record(method, urlOf(input), 0, startedAt);
                throw error;
            }
        };
        this.#restore.push(() => {
            window.fetch = original;
        });
    }

    #wrapXhr(){
        if(typeof XMLHttpRequest === 'undefined') return;
        const prototype = XMLHttpRequest.prototype;
        const open = prototype.open;
        const send = prototype.send;
        const record = (method: string, url: string, status: number, startedAt: number) => this.#record(method, url, status, startedAt);
        const meta = new WeakMap<XMLHttpRequest, { method: string; url: string }>();

        prototype.open = function(this: XMLHttpRequest, method: string, url: string | URL, ...rest: unknown[]){
            meta.set(this, { method, url: String(url) });
            return (open as (...args: unknown[]) => void).call(this, method, url, ...rest);
        } as typeof prototype.open;
        prototype.send = function(this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null){
            const startedAt = performance.now();
            const request = meta.get(this);
            if(request !== undefined){
                this.addEventListener('loadend', () => record(request.method, request.url, this.status, startedAt));
            }
            return send.call(this, body);
        };
        this.#restore.push(() => {
            prototype.open = open;
            prototype.send = send;
        });
    }
}
