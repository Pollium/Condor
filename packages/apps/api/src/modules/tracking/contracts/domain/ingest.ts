import { Attribution, IngestBatchJob, IngestEvent } from '@/modules/tracking/contracts/domain/queue';

export type IngestOf<T extends IngestEvent['type']> = Extract<IngestEvent, { type: T }>;

export const eventsOfType = <T extends IngestEvent['type']>(events: IngestEvent[], type: T): IngestOf<T>[] => {
    return events.filter((event): event is IngestOf<T> => event.type === type);
};

export interface SessionTally{
    firstAt: Date;
    lastAt: Date;
    events: number;
    pageviews: number;
    clicks: number;
    rageClicks: number;
    deadClicks: number;
    errors: number;
    uturns: number;
    activeSeconds: number;
    scrollDepth: number;
    entryPath: string | null;
    exitPath: string | null;
    exitAt: Date | null;
    attribution: Attribution | null;
    converted: boolean;
}

export interface SessionBatch extends IngestBatchJob{
    sessionId: string;
}
