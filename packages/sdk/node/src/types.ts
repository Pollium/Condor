export type TraitValue = string | number | boolean | null;

export type Traits = Record<string, TraitValue>;

export interface CondorOptions{
    key: string;
    host: string;
    release?: string;
    flushAt?: number;
    flushIntervalMs?: number;
    maxRetries?: number;
    fetch?: typeof fetch;
    onError?: (error: Error) => void;
}

export interface TrackInput{
    userId: string;
    name: string;
    props?: Traits;
    timestamp?: Date | number;
    path?: string;
}

export interface IdentifyInput{
    userId: string;
    traits?: Traits;
    timestamp?: Date | number;
}
