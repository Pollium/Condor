import { Dimension } from '@condor/contracts/overview/domain';
import { Slice } from '@condor/contracts/shared/analytics';

export type RangeDimension = Extract<Dimension, 'frequency' | 'duration' | 'depth'>;

export type LandingDimension = Extract<Dimension, 'entry' | 'exit'>;

export type SessionColumn = Exclude<Dimension, RangeDimension | LandingDimension | 'page' | 'event' | 'frustration'>;

export interface BreakdownScope{
    projectId: string;
    from: Date;
    limit: number;
}

export interface BreakdownSlices{
    total: number;
    slices: Slice[];
}

export interface RankedSql{
    source: string;
    ranked: string;
}

export interface SliceRange{
    id: string;
    from: number;
}
