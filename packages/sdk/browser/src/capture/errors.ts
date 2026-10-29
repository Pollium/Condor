import { Emit } from '../types';

const MAX_PER_PAGE = 20;

const sourceOf = (event: ErrorEvent): string | undefined =>
    event.filename ? `${event.filename}:${event.lineno}:${event.colno}`.slice(0, 1024) : undefined;

export default class ErrorTracker{
    #seen = new Set<string>();
    #onError = (event: ErrorEvent) => this.#report(event.error, event.message, sourceOf(event));
    #onRejection = (event: PromiseRejectionEvent) => this.#report(event.reason, undefined, undefined, 'UnhandledRejection');

    constructor(private readonly emit: Emit){}

    start(){
        window.addEventListener('error', this.#onError);
        window.addEventListener('unhandledrejection', this.#onRejection);
    }

    stop(){
        window.removeEventListener('error', this.#onError);
        window.removeEventListener('unhandledrejection', this.#onRejection);
    }

    pageChanged(){
        this.#seen.clear();
    }

    report(errorType: string, message: string, extra: { stack?: string; source?: string } = {}){
        const key = `${errorType}:${message}`;
        if(this.#seen.has(key) || this.#seen.size >= MAX_PER_PAGE) return;
        this.#seen.add(key);
        this.emit({
            type: 'error',
            errorType: errorType.slice(0, 128),
            message: message.slice(0, 2048),
            ...(extra.stack ? { stack: extra.stack.slice(0, 16384) } : {}),
            ...(extra.source ? { source: extra.source } : {})
        });
    }

    #report(error: unknown, fallback: string | undefined, source: string | undefined, rejection?: string){
        if(error instanceof Error){
            this.report(error.name || 'Error', error.message || fallback || 'Error', { stack: error.stack, source: source ?? this.#topFrame(error.stack) });
            return;
        }
        const message = fallback ?? (typeof error === 'string' ? error : this.#describe(error));
        this.report(rejection ?? 'Error', message, { source });
    }

    #topFrame(stack: string | undefined): string | undefined{
        const frame = stack?.split('\n').find((line) => /:\d+:\d+/.test(line));
        const match = frame?.match(/(\S+:\d+:\d+)\)?\s*$/);
        return match?.[1]?.replace(/^\(/, '');
    }

    #describe(value: unknown): string{
        try{
            return JSON.stringify(value) ?? String(value);
        }catch{
            return String(value);
        }
    }
}
