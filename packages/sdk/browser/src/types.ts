import { Traits } from '@condor/contracts/shared/analytics';
import { WireEvent } from '@condor/contracts/ingest/wire';

export interface InitOptions{
    key: string;
    host?: string;
    release?: string;
    autocapture?: boolean;
    recording?: boolean;
    respectDnt?: boolean;
    maskAllInputs?: boolean;
    debug?: boolean;
}

export interface StoredSession{
    id: string;
    startedAt: number;
    lastActivity: number;
    seq: number;
    sampled: boolean | null;
}

type WithoutBase<T> = T extends unknown ? Omit<T, 'id' | 'timestamp' | 'path' | 'title'> : never;

export type EventDraft = WithoutBase<WireEvent>;

export interface EventPlace{
    path: string;
    title?: string;
}

export type Emit = (draft: EventDraft, place?: EventPlace) => void;

export type { Traits };
