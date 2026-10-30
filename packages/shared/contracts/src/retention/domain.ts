import { SegmentQuery } from '../shared/segment';

export type RetentionGrain = 'day' | 'week';

export interface Cohort{
    start: string;
    size: number;
    values: number[];
}

export interface Retention{
    grain: RetentionGrain;
    returnEvent: string | null;
    cohorts: Cohort[];
    average: number[];
}

export interface RetentionQuery extends SegmentQuery{
    grain?: RetentionGrain;
    cohorts?: number;
    returnEvent?: string;
}
