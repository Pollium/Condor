import { Device } from '../shared/analytics';
import { BaseEntity } from '../shared/base';
import { Period } from '../shared/period';
import { Segment, SegmentQuery } from '../shared/segment';

export type FunnelStepKind = 'page' | 'event';

export interface FunnelStep{
    kind: FunnelStepKind;
    match: string;
    label: string;
    where?: Segment;
}

export interface Funnel extends BaseEntity{
    projectId: string;
    name: string;
    steps: FunnelStep[];
    windowHours: number;
}

export interface FunnelStepResult extends FunnelStep{
    people: number;
    fromStart: number;
    fromPrevious: number;
    medianSeconds: number | null;
}

export interface FunnelDeviceResult{
    device: Device;
    people: number[];
}

export interface FunnelResult{
    funnelId: string;
    period: Period;
    windowHours: number;
    conversion: number;
    previousConversion: number;
    medianSeconds: number | null;
    steps: FunnelStepResult[];
    byDevice: FunnelDeviceResult[];
}

export interface FunnelResultQuery extends SegmentQuery{
    period?: Period;
    windowHours?: number;
}
