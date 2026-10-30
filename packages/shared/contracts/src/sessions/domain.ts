import { Channel, Device, EventType, Traits } from '../shared/analytics';
import { Period } from '../shared/period';
import { SegmentQuery } from '../shared/segment';

export interface SessionSignals{
    rage: number;
    dead: number;
    errors: number;
    uturns: number;
}

export interface PersonSummary{
    id: string;
    anonymousId: string;
    userId: string | null;
    name: string | null;
    email: string | null;
    traits: Traits;
    firstSeenAt: string;
    lastSeenAt: string;
    sessions: number;
}

export interface SessionSummary{
    id: string;
    personId: string;
    anonymousId: string;
    userId: string | null;
    name: string | null;
    email: string | null;
    startedAt: string;
    endedAt: string;
    duration: number;
    activeDuration: number;
    pageviews: number;
    events: number;
    country: string | null;
    city: string | null;
    device: Device;
    os: string | null;
    browser: string | null;
    entryPath: string | null;
    exitPath: string | null;
    currentPath: string | null;
    channel: Channel;
    source: string | null;
    release: string | null;
    signals: SessionSignals;
    converted: boolean;
    hasReplay: boolean;
    live: boolean;
    activity: number[];
}

export interface SessionEvent{
    id: string;
    type: EventType;
    name: string | null;
    path: string;
    rawPath: string;
    title: string | null;
    timestamp: string;
    offsetMs: number;
    selector: string | null;
    text: string | null;
    value: number | null;
    rage: boolean;
    dead: boolean;
    props: Record<string, unknown> | null;
}

export interface SessionDetail extends SessionSummary{
    language: string | null;
    timezone: string | null;
    screenWidth: number | null;
    screenHeight: number | null;
    viewportWidth: number | null;
    connection: string | null;
    osVersion: string | null;
    browserVersion: string | null;
    referrer: string | null;
    utmCampaign: string | null;
    person: PersonSummary;
    timeline: SessionEvent[];
}

export interface Replay{
    sessionId: string;
    chunks: number;
    events: unknown[];
}

export type SessionSignal = 'rage' | 'dead' | 'error' | 'uturn';

export type SessionSort = 'recent' | 'longest' | 'events' | 'frustrated';

export interface SessionListQuery extends SegmentQuery{
    period?: Period;
    search?: string;
    device?: Device;
    country?: string;
    signal?: SessionSignal;
    converted?: 'true' | 'false';
    identified?: 'true' | 'false';
    replay?: 'true' | 'false';
    personId?: string;
    sort?: SessionSort;
    limit?: number;
    offset?: number;
}

export interface PersonDetail extends PersonSummary{
    recent: SessionSummary[];
}
