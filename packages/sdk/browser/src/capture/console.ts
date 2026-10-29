import { ConsoleLevel, ReplayConsoleEntry } from '@condor/contracts/ingest/wire';

const LEVELS: ConsoleLevel[] = ['log', 'info', 'warn', 'error', 'debug'];
const MAX_MESSAGE = 1024;

const stringify = (value: unknown): string => {
    if(typeof value === 'string') return value;
    if(value instanceof Error) return `${value.name}: ${value.message}`;
    const seen = new WeakSet<object>();
    try{
        return JSON.stringify(value, (_key, inner: unknown) => {
            if(typeof inner === 'object' && inner !== null){
                if(seen.has(inner)) return '[Circular]';
                seen.add(inner);
            }
            return inner;
        }) ?? String(value);
    }catch{
        return String(value);
    }
};

export const messageOf = (args: unknown[]): string => {
    const message = args.map(stringify).join(' ');
    return message.length > MAX_MESSAGE ? `${message.slice(0, MAX_MESSAGE - 1)}…` : message;
};

export default class ConsoleTracker{
    #restore: Array<() => void> = [];

    constructor(private readonly sink: (entry: ReplayConsoleEntry) => void){}

    start(){
        for(const level of LEVELS){
            const original = console[level];
            const sink = this.sink;
            console[level] = (...args: unknown[]) => {
                original.apply(console, args);
                try{
                    sink({ level, message: messageOf(args) });
                }catch{
                    return;
                }
            };
            this.#restore.push(() => {
                console[level] = original;
            });
        }
    }

    stop(){
        for(const restore of this.#restore) restore();
        this.#restore = [];
    }
}
