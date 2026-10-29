import { RetentionGrain } from '@condor/contracts/retention/domain';

export const RETENTION_GRAINS: readonly RetentionGrain[] = ['day', 'week'];

export interface RetentionFilter{
    grain: RetentionGrain;
    cohorts: number;
    returnEvent: string | null;
}

export interface CohortCounts{
    start: string;
    size: number;
    retained: number[];
}
