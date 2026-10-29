import { Slice, VitalName, VitalRating } from '../shared/analytics';
import { Period } from '../shared/period';

export type Dimension =
    | 'country'
    | 'city'
    | 'language'
    | 'os'
    | 'browser'
    | 'device'
    | 'screen'
    | 'connection'
    | 'channel'
    | 'source'
    | 'campaign'
    | 'page'
    | 'entry'
    | 'exit'
    | 'release'
    | 'event'
    | 'frustration'
    | 'frequency'
    | 'duration'
    | 'depth';

export const DIMENSIONS: readonly Dimension[] = [
    'country', 'city', 'language', 'os', 'browser', 'device', 'screen', 'connection',
    'channel', 'source', 'campaign', 'page', 'entry', 'exit', 'release', 'event',
    'frustration', 'frequency', 'duration', 'depth'
];

export interface Breakdown{
    dimension: Dimension;
    period: Period;
    total: number;
    slices: Slice[];
}

export type KpiKey = 'sessions' | 'people' | 'duration' | 'bounce' | 'frustrated' | 'errors';

export interface Kpi{
    key: KpiKey;
    value: number;
    previous: number;
    series: number[];
}

export interface AudiencePoint{
    fresh: number;
    returning: number;
}

export interface Summary{
    period: Period;
    buckets: string[];
    kpis: Kpi[];
    audience: AudiencePoint[];
    pageviews: number;
}

export interface Engagement{
    activeSeconds: number;
    activeShare: number;
    scrollDepth: number;
    clicksPerSession: number;
    ragePer100: number;
    sessionsPerPerson: number;
}

export interface HourCell{
    weekday: number;
    hour: number;
    sessions: number;
}

export interface Vital{
    name: VitalName;
    p75: number;
    good: number;
    rating: VitalRating;
    samples: number;
}

export interface LivePage{
    path: string;
    people: number;
}

export interface LiveSnapshot{
    count: number;
    pages: LivePage[];
}

export interface BreakdownQuery{
    period?: Period;
    dimension: Dimension;
    limit?: number;
}
