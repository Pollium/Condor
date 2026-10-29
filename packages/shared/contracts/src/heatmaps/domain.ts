import { Period } from '../shared/period';

export type HeatMode = 'clicks' | 'rage' | 'scroll';

export type HeatWidth = 'desktop' | 'tablet' | 'mobile';

export interface HeatPage{
    path: string;
    title: string | null;
    views: number;
    clicks: number;
}

export interface HeatPoint{
    x: number;
    y: number;
    weight: number;
}

export interface HeatElement{
    selector: string;
    text: string | null;
    clicks: number;
    rage: number;
    dead: number;
}

export interface ScrollReach{
    depth: number;
    share: number;
}

export interface HeatSnapshot{
    sessionId: string;
    timestamp: number;
}

export interface Heatmap{
    path: string;
    mode: HeatMode;
    width: HeatWidth;
    period: Period;
    sessions: number;
    clicks: number;
    averageDepth: number;
    viewportWidth: number;
    documentHeight: number;
    points: HeatPoint[];
    elements: HeatElement[];
    reach: ScrollReach[];
    snapshot: HeatSnapshot | null;
}

export interface HeatmapQuery{
    path: string;
    mode?: HeatMode;
    width?: HeatWidth;
    period?: Period;
}
