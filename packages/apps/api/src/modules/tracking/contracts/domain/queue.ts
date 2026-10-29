import { Channel, Device } from '@condor/contracts/shared/analytics';
import { WireEvent } from '@condor/contracts/ingest/wire';

export const ingestQueues = {
    batch: 'condor-ingest-batch',
    replay: 'condor-ingest-replay'
} as const;

export interface Attribution{
    channel: Channel;
    source: string | null;
    referrer: string | null;
    referrerHost: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
}

export interface EnrichedContext{
    country: string | null;
    region: string | null;
    city: string | null;
    os: string | null;
    osVersion: string | null;
    browser: string | null;
    browserVersion: string | null;
    device: Device;
    language: string | null;
    timezone: string | null;
    screenWidth: number | null;
    screenHeight: number | null;
    viewportWidth: number | null;
    connection: string | null;
    release: string | null;
}

export type IngestEvent = WireEvent & {
    rawPath: string;
    attribution?: Attribution;
};

export interface IngestBatchJob{
    projectId: string;
    receivedAt: number;
    anonymousId: string;
    userId: string | null;
    sessionId: string | null;
    sdk: string;
    context: EnrichedContext;
    events: IngestEvent[];
}

export interface IngestReplayJob{
    projectId: string;
    sessionId: string;
    seq: number;
    storageKey: string;
    size: number;
    eventCount: number;
    firstTimestamp: number;
    lastTimestamp: number;
    hasFullSnapshot: boolean;
    receivedAt: number;
}

export const replayStorageKey = (projectId: string, sessionId: string, seq: number): string =>
    `replays/${projectId}/${sessionId}/${String(seq).padStart(6, '0')}.json.gz`;
