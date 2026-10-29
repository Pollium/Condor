import { Platform } from './domain';

export interface CreateProjectInput{
    /**
     * @minLength 1
     * @maxLength 80
     */
    name: string;
    /**
     * @minLength 1
     * @maxLength 253
     */
    host: string;
    platform: Platform;
    /** @maxLength 64 */
    timezone?: string;
}

export interface UpdateProjectInput{
    /**
     * @minLength 1
     * @maxLength 80
     */
    name?: string;
    /**
     * @minLength 1
     * @maxLength 253
     */
    host?: string;
    /** @pattern ^#[0-9a-fA-F]{6}$ */
    tint?: string;
}

export interface UpdateSettingsInput{
    recordingEnabled?: boolean;
    /**
     * @minimum 0
     * @maximum 100
     */
    sampleRate?: number;
    maskInputs?: boolean;
    maskText?: boolean;
    /** @maxLength 1024 */
    blockSelector?: string;
    respectDnt?: boolean;
    captureConsole?: boolean;
    captureNetwork?: boolean;
    /**
     * @minimum 1
     * @maximum 3650
     */
    retentionDays?: number;
    /** @maxItems 100 */
    routeGroups?: string[];
    /** @maxLength 128 */
    conversionEvent?: string | null;
    /**
     * @minLength 1
     * @maxLength 64
     */
    timezone?: string;
}
