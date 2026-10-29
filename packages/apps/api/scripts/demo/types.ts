import { Attribution, IngestBatchJob, IngestEvent } from '@/modules/tracking/contracts/domain/queue';
import { Device } from '@condor/contracts/shared/analytics';

export interface Weighted<T>{
    value: T;
    weight: number;
}

export interface DemoCity{
    city: string;
    region: string;
    country: string;
    language: string;
    timezone: string;
    utcOffset: number;
}

export interface DemoDevice{
    device: Device;
    os: string;
    osVersion: string;
    browser: string;
    browserVersion: string;
    screenWidth: number;
    screenHeight: number;
    viewportWidth: number;
}

export interface DemoIdentity{
    userId: string;
    name: string;
    email: string;
}

export interface Visitor{
    anonymousId: string;
    city: DemoCity;
    device: DemoDevice;
    identity: DemoIdentity | null;
    identifiesOn: number;
    campaign: boolean;
    visits: number[];
}

export interface Visit{
    visitor: Visitor;
    sessionId: string;
    day: number;
    ordinal: number;
    startedAt: number;
    release: string;
    attribution: Attribution;
}

export type PageKind = 'home' | 'catalog' | 'product' | 'cart' | 'checkout' | 'offers' | 'account';

export interface DemoProduct{
    slug: string;
    name: string;
    price: number;
}

export interface DemoPage{
    kind: PageKind;
    product: DemoProduct | null;
}

export interface ClickTarget{
    selector: string;
    text: string;
    desktop: [number, number];
    mobile: [number, number];
    rage: number;
    dead: number;
}

export interface DemoBug{
    page: PageKind;
    errorType: string;
    messages: string[];
    frame: string;
    probability: number;
    occurs: (visit: Visit) => boolean;
}

export interface IssueMilestone{
    day: number;
    message: string;
    status: 'resolved' | 'ignored';
}

export interface WalkState{
    visit: Visit;
    events: IngestEvent[];
    at: number;
    cart: DemoProduct[];
    previous: DemoPage | null;
    uturn: boolean;
    identified: boolean;
}

export interface DemoDay{
    day: number;
    startsAt: Date;
    jobs: IngestBatchJob[];
}
