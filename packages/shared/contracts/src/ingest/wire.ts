import { Traits, VitalName, VitalRating } from '../shared/analytics';

export interface WireUtm{
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
}

interface WireEventBase{
    /** @format uuid */
    id: string;
    timestamp: number;
    /** @maxLength 2048 */
    path: string;
    /** @maxLength 512 */
    title?: string;
}

export interface WirePageview extends WireEventBase{
    type: 'pageview';
    /** @maxLength 2048 */
    referrer?: string;
    utm?: WireUtm;
    uturn?: boolean;
}

export interface WirePageleave extends WireEventBase{
    type: 'pageleave';
    durationMs: number;
    activeMs: number;
    scrollDepth: number;
    documentHeight: number;
}

export interface WireClick extends WireEventBase{
    type: 'click';
    x: number;
    y: number;
    viewportWidth: number;
    documentHeight: number;
    /** @maxLength 1024 */
    selector: string;
    /** @maxLength 256 */
    text?: string;
    rage: boolean;
    dead: boolean;
}

export interface WireCustom extends WireEventBase{
    type: 'custom';
    /**
     * @minLength 1
     * @maxLength 128
     */
    name: string;
    props?: Traits;
}

export interface WireError extends WireEventBase{
    type: 'error';
    /** @maxLength 128 */
    errorType: string;
    /** @maxLength 2048 */
    message: string;
    /** @maxLength 16384 */
    stack?: string;
    /** @maxLength 1024 */
    source?: string;
}

export interface WireVital extends WireEventBase{
    type: 'vital';
    name: VitalName;
    value: number;
    rating: VitalRating;
}

export interface WireIdentify extends WireEventBase{
    type: 'identify';
    /**
     * @minLength 1
     * @maxLength 256
     */
    userId: string;
    traits?: Traits;
}

export type WireEvent = WirePageview | WirePageleave | WireClick | WireCustom | WireError | WireVital | WireIdentify;

export interface WireContext{
    /** @maxLength 64 */
    language?: string;
    /** @maxLength 64 */
    timezone?: string;
    screenWidth?: number;
    screenHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    /** @maxLength 16 */
    connection?: string;
    /** @maxLength 64 */
    release?: string;
}

export interface WireSdk{
    /** @maxLength 64 */
    name: string;
    /** @maxLength 32 */
    version: string;
}

export interface WireBatch{
    /** @minLength 1 */
    key: string;
    sdk: WireSdk;
    sentAt: number;
    /**
     * @minLength 1
     * @maxLength 128
     */
    anonymousId: string;
    /** @maxLength 256 */
    userId?: string | null;
    /** @format uuid */
    sessionId?: string;
    context: WireContext;
    /** @maxItems 500 */
    events: WireEvent[];
}

export interface WireReplayChunk{
    /** @minLength 1 */
    key: string;
    /** @format uuid */
    sessionId: string;
    /** @minimum 0 */
    seq: number;
    sentAt: number;
    /** @minItems 1 */
    events: unknown[];
}

export interface IngestReceipt{
    accepted: number;
}

export const REPLAY_CUSTOM_TAGS = {
    console: 'condor.console',
    network: 'condor.network'
} as const;

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface ReplayConsoleEntry{
    level: ConsoleLevel;
    message: string;
}

export interface ReplayNetworkEntry{
    method: string;
    url: string;
    status: number;
    durationMs: number;
    failed: boolean;
}
