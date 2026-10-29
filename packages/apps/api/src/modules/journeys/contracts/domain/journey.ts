import { JourneyNode, JourneyRoute } from '@condor/contracts/journeys/domain';
import { Period } from '@condor/contracts/shared/period';

export interface JourneyFilter{
    period: Period;
    steps: number;
    start: string | null;
    exits: boolean;
}

export type StepCount = Omit<JourneyNode, 'id'>;

export interface StepLink{
    step: number;
    source: string;
    target: string;
    sessions: number;
}

export interface JourneyRows{
    sessions: string;
    leftAfterFirst: string;
    nodes: StepCount[];
    links: StepLink[];
    exits: StepCount[];
    routes: JourneyRoute[];
}
