import { BaseEntity } from '../shared/base';

export type Platform = 'web' | 'server';

export interface ProjectSettings{
    recordingEnabled: boolean;
    sampleRate: number;
    maskInputs: boolean;
    maskText: boolean;
    blockSelector: string;
    respectDnt: boolean;
    captureConsole: boolean;
    captureNetwork: boolean;
    retentionDays: number;
    routeGroups: string[];
    conversionEvent: string | null;
    timezone: string;
}

export interface Project extends BaseEntity{
    name: string;
    host: string;
    platform: Platform;
    tint: string;
    publicKey: string;
    settings: ProjectSettings;
    lastEventAt: string | null;
}

export interface ProjectStatus{
    lastEventAt: string | null;
    eventsToday: number;
    sessionsToday: number;
    replaysToday: number;
}
