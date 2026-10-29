import { Period } from '../shared/period';

export const JOURNEY_EXIT = '(salida)';
export const JOURNEY_OTHER = '(otras)';

export interface JourneyNode{
    id: string;
    step: number;
    path: string;
    sessions: number;
}

export interface JourneyLink{
    source: string;
    target: string;
    sessions: number;
}

export interface JourneyRoute{
    paths: string[];
    sessions: number;
}

export interface Journey{
    period: Period;
    steps: number;
    start: string | null;
    sessions: number;
    leftAfterFirst: number;
    nodes: JourneyNode[];
    links: JourneyLink[];
    routes: JourneyRoute[];
}

export interface JourneyQuery{
    period?: Period;
    steps?: number;
    start?: string;
    exits?: 'true' | 'false';
}
