import { FunnelDeviceResult, FunnelStep } from '@condor/contracts/funnels/domain';
import { Period } from '@condor/contracts/shared/period';

export interface FunnelResultFilter{
    period: Period;
    windowHours: number | null;
}

export interface FunnelRun{
    projectId: string;
    steps: FunnelStep[];
    from: Date;
    until: Date;
    windowHours: number;
}

export interface FunnelProgress{
    people: number[];
    medianFromPrevious: Array<number | null>;
    medianFromStart: number | null;
    byDevice: FunnelDeviceResult[];
}
