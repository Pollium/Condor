import { RetentionGrain } from '@condor/contracts/retention/domain';
import { Segment } from '@condor/contracts/shared/segment';

export const RETENTION_GRAINS: readonly RetentionGrain[] = ['day', 'week'];

export interface RetentionFilter{
    grain: RetentionGrain;
    cohorts: number;
    returnEvent: string | null;
    segment: Segment | null;
}

export interface CohortCounts{
    start: string;
    size: number;
    retained: number[];
}
