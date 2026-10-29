import { FunnelStepKind } from './domain';

export interface FunnelStepInput{
    kind: FunnelStepKind;
    /**
     * @minLength 1
     * @maxLength 256
     */
    match: string;
    /**
     * @minLength 1
     * @maxLength 80
     */
    label: string;
}

export interface CreateFunnelInput{
    /**
     * @minLength 1
     * @maxLength 80
     */
    name: string;
    /**
     * @minItems 2
     * @maxItems 8
     */
    steps: FunnelStepInput[];
    /**
     * @minimum 1
     * @maximum 720
     */
    windowHours: number;
}

export interface UpdateFunnelInput{
    /**
     * @minLength 1
     * @maxLength 80
     */
    name?: string;
    /**
     * @minItems 2
     * @maxItems 8
     */
    steps?: FunnelStepInput[];
    /**
     * @minimum 1
     * @maximum 720
     */
    windowHours?: number;
}
