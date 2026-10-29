import Project from '@/modules/projects/models/Project';
import { Attribution, EnrichedContext, IngestBatchJob, IngestEvent, IngestReplayJob, replayStorageKey } from '@/modules/tracking/contracts/domain/queue';
import { Traits } from '@condor/contracts/shared/analytics';
import { IngestOf, SessionBatch } from '../contracts/domain/ingest';
import { Seed } from '@tests/Seed';
import { randomUUID } from 'node:crypto';

const REPLAY_CHUNK_BYTES = 2048;
const REPLAY_EVENTS = 40;
const REPLAY_SPAN_MS = 5000;

export const secondsAgo = (seconds: number): number => Date.now() - seconds * 1000;

export class TrackingSeed extends Seed{
    context(overrides: Partial<EnrichedContext> = {}): EnrichedContext{
        return {
            country: 'CL',
            region: 'RM',
            city: 'Santiago',
            os: 'iOS',
            osVersion: '18.1',
            browser: 'Safari',
            browserVersion: '18.1',
            device: 'mobile',
            language: 'es-CL',
            timezone: 'America/Santiago',
            screenWidth: 390,
            screenHeight: 844,
            viewportWidth: 390,
            connection: '4g',
            release: '2.4.0',
            ...overrides
        };
    }

    attribution(overrides: Partial<Attribution> = {}): Attribution{
        return {
            channel: 'paid',
            source: 'google',
            referrer: 'https://www.google.com/',
            referrerHost: 'www.google.com',
            utmSource: 'google',
            utmMedium: 'cpc',
            utmCampaign: 'cyber-andes',
            utmContent: null,
            utmTerm: null,
            ...overrides
        };
    }

    batch(project: Project, events: IngestEvent[], overrides: Partial<SessionBatch> = {}): SessionBatch{
        return {
            projectId: project.id,
            receivedAt: Date.now(),
            anonymousId: `anon_${randomUUID()}`,
            userId: null,
            sessionId: randomUUID(),
            sdk: 'condor-browser@0.1.0',
            context: this.context(),
            events,
            ...overrides
        };
    }

    serverBatch(project: Project, events: IngestEvent[]): IngestBatchJob{
        return {
            ...this.batch(project, events),
            sessionId: null
        };
    }

    pageview(path: string, at: number, overrides: Partial<IngestOf<'pageview'>> = {}): IngestOf<'pageview'>{
        return {
            id: randomUUID(),
            type: 'pageview',
            timestamp: at,
            path,
            rawPath: path,
            title: 'Tienda Andes',
            ...overrides
        };
    }

    pageleave(path: string, at: number, overrides: Partial<IngestOf<'pageleave'>> = {}): IngestOf<'pageleave'>{
        return {
            id: randomUUID(),
            type: 'pageleave',
            timestamp: at,
            path,
            rawPath: path,
            durationMs: 30_000,
            activeMs: 20_000,
            scrollDepth: 0.5,
            documentHeight: 2400,
            ...overrides
        };
    }

    click(path: string, at: number, overrides: Partial<IngestOf<'click'>> = {}): IngestOf<'click'>{
        return {
            id: randomUUID(),
            type: 'click',
            timestamp: at,
            path,
            rawPath: path,
            x: 0.5,
            y: 640,
            viewportWidth: 390,
            documentHeight: 2400,
            selector: 'button.add-to-cart',
            text: 'Añadir al carrito',
            rage: false,
            dead: false,
            ...overrides
        };
    }

    custom(name: string, at: number, props: Traits = {}): IngestOf<'custom'>{
        return {
            id: randomUUID(),
            type: 'custom',
            timestamp: at,
            path: '/checkout',
            rawPath: '/checkout',
            name,
            props
        };
    }

    error(at: number, overrides: Partial<IngestOf<'error'>> = {}): IngestOf<'error'>{
        return {
            id: randomUUID(),
            type: 'error',
            timestamp: at,
            path: '/carrito',
            rawPath: '/carrito',
            errorType: 'TypeError',
            message: "Cannot read properties of undefined (reading 'price')",
            stack: "TypeError: Cannot read properties of undefined (reading 'price')\n    at total (https://tiendaandes.cl/assets/cart.js:42:13)\n    at render (https://tiendaandes.cl/assets/app.js:10:2)",
            source: 'https://tiendaandes.cl/assets/cart.js:42:13',
            ...overrides
        };
    }

    identify(userId: string, at: number, traits: Traits = {}): IngestOf<'identify'>{
        return {
            id: randomUUID(),
            type: 'identify',
            timestamp: at,
            path: '/cuenta',
            rawPath: '/cuenta',
            userId,
            traits
        };
    }

    replay(project: Project, sessionId: string, seq: number, overrides: Partial<IngestReplayJob> = {}): IngestReplayJob{
        const firstTimestamp = Date.now() - REPLAY_SPAN_MS;

        return {
            projectId: project.id,
            sessionId,
            seq,
            storageKey: replayStorageKey(project.id, sessionId, seq),
            size: REPLAY_CHUNK_BYTES,
            eventCount: REPLAY_EVENTS,
            firstTimestamp,
            lastTimestamp: firstTimestamp + REPLAY_SPAN_MS,
            hasFullSnapshot: seq === 0,
            receivedAt: Date.now(),
            ...overrides
        };
    }
}

export const trackingSeed = new TrackingSeed();
