import { REPLAY_CUSTOM_TAGS, ReplayConsoleEntry, ReplayNetworkEntry } from '@condor/contracts/ingest/wire';

export interface Recorded{
    type: number;
    timestamp: number;
    data: unknown;
}

export interface Viewport{
    width: number;
    height: number;
}

export interface Timed<T>{
    key: string;
    at: number;
    entry: T;
}

export interface Recording{
    events: Recorded[];
    start: number;
    viewport: Viewport;
    console: Timed<ReplayConsoleEntry>[];
    network: Timed<ReplayNetworkEntry>[];
}

const META = 4;
const CUSTOM = 5;

const isRecorded = (value: unknown): value is Recorded =>
    typeof value === 'object' && value !== null && typeof (value as Recorded).type === 'number' && typeof (value as Recorded).timestamp === 'number';

const custom = <T>(events: Recorded[], start: number, tag: string): Timed<T>[] =>
    events.flatMap((event, index) => {
        const data = event.data as { tag?: string; payload?: T } | null;
        return event.type === CUSTOM && data?.tag === tag && data.payload !== undefined
            ? [{ key: `${index}`, at: event.timestamp - start, entry: data.payload }]
            : [];
    });

export const readRecording = (raw: unknown[]): Recording | null => {
    const events = raw.filter(isRecorded).sort((a, b) => a.timestamp - b.timestamp);
    if(events.length < 2) return null;
    const start = events[0].timestamp;
    const meta = events.find((event) => event.type === META)?.data as Partial<Viewport> | undefined;
    return {
        events,
        start,
        viewport: { width: meta?.width || 1280, height: meta?.height || 800 },
        console: custom<ReplayConsoleEntry>(events, start, REPLAY_CUSTOM_TAGS.console),
        network: custom<ReplayNetworkEntry>(events, start, REPLAY_CUSTOM_TAGS.network)
    };
};
