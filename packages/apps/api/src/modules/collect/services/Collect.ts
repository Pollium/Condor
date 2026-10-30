import GeoService, { GeoLocation } from './Geo';
import QueueProducer from '@readable/queues/QueueProducer';
import RawResponse from '@readable/controllers/responses/Raw';
import { objectStorage } from '@readable/storage/ObjectStorage';
import { IngestProject } from '@/modules/projects/contracts/domain/project';
import { RemoteConfig } from '@condor/contracts/ingest/config';
import { EnrichedContext, IngestBatchJob, IngestEvent, IngestReplayJob, ingestQueues, replayStorageKey } from '@/modules/tracking/contracts/domain/queue';
import { IngestReceipt, WireBatch, WireContext, WireEvent, WireReplayChunk } from '@condor/contracts/ingest/wire';
import { config } from '@/shared/config';
import { IngestError, ScriptError } from '../contracts/domain/errors';
import { attribute, hostOf } from './Attribution';
import { normalizePath } from './PathNormalizer';
import { projectDirectory } from './ProjectDirectory';
import { ParsedUserAgent, parseUserAgent } from './UserAgent';
import { readFile } from 'node:fs/promises';
import { IncomingHttpHeaders } from 'node:http';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';

export interface Client{
    ip: string;
    headers: IncomingHttpHeaders;
}

interface RecordedEvent{
    type?: unknown;
    timestamp?: unknown;
}

const FULL_SNAPSHOT = 2;
const REPLAY_CONTENT_TYPE = 'application/json';
const SCRIPT_CONTENT_TYPE = 'application/javascript; charset=utf-8';
const MISSING_FILE = 'ENOENT';

const compress = promisify(gzip);

const recorded = (event: unknown): RecordedEvent =>
    typeof event === 'object' && event !== null ? event : {};

const timestampsOf = (events: unknown[]): number[] => events
    .map((event) => recorded(event).timestamp)
    .filter((timestamp): timestamp is number => typeof timestamp === 'number' && Number.isFinite(timestamp));

const contextOf = (context: WireContext, agent: ParsedUserAgent, geo: GeoLocation): EnrichedContext => ({
    country: geo.country,
    region: geo.region,
    city: geo.city,
    os: agent.os,
    osVersion: agent.osVersion,
    browser: agent.browser,
    browserVersion: agent.browserVersion,
    device: agent.device,
    language: context.language ?? null,
    timezone: context.timezone ?? null,
    screenWidth: context.screenWidth ?? null,
    screenHeight: context.screenHeight ?? null,
    viewportWidth: context.viewportWidth ?? null,
    connection: context.connection ?? null,
    release: context.release ?? null
});

const NETWORK_MESSAGE = /^(\S+) (\S+) → (.+)$/;

const groupedRequest = (message: string, routeGroups: string[]): string => {
    const match = NETWORK_MESSAGE.exec(message);
    if(match === null) return message;
    const [, method, target, outcome] = match;
    const origin = target.startsWith('/') ? '' : /^https?:\/\/[^/]+/.exec(target)?.[0] ?? '';
    const grouped = normalizePath(target.slice(origin.length) || '/', routeGroups).path;
    return `${method} ${origin}${grouped} → ${outcome}`;
};

const eventOf = (event: WireEvent, skew: number, project: IngestProject, pageHost: string | null): IngestEvent => {
    const enriched = {
        ...event,
        ...normalizePath(event.path, project.settings.routeGroups),
        timestamp: event.timestamp + skew
    };
    if(event.type === 'error' && event.errorType === 'Network'){
        return { ...event, ...normalizePath(event.path, project.settings.routeGroups), timestamp: enriched.timestamp, message: groupedRequest(event.message, project.settings.routeGroups) };
    }
    if(event.type !== 'pageview') return enriched;

    const attribution = attribute({
        referrer: event.referrer,
        utm: event.utm,
        projectHost: project.host,
        pageHost
    });

    return attribution === undefined ? enriched : { ...enriched, attribution };
};

export default class CollectService{
    #batches = new QueueProducer<IngestBatchJob>(ingestQueues.batch);
    #replays = new QueueProducer<IngestReplayJob>(ingestQueues.replay);
    #geo = new GeoService(config.geoipDatabase, config.trustGeoHeaders);

    async remoteConfig(key: string | undefined): Promise<RemoteConfig>{
        if(key === undefined || key === '') throw IngestError.UnknownKey();
        const { projectId, settings } = await projectDirectory.resolve(key);

        return {
            projectId,
            respectDnt: settings.respectDnt,
            recording: {
                enabled: settings.recordingEnabled,
                sampleRate: settings.sampleRate,
                maskInputs: settings.maskInputs,
                maskText: settings.maskText,
                blockSelector: settings.blockSelector === '' ? null : settings.blockSelector,
                captureConsole: settings.captureConsole,
                captureNetwork: settings.captureNetwork
            }
        };
    }

    async batch(body: WireBatch, client: Client): Promise<IngestReceipt>{
        const project = await projectDirectory.resolve(body.key);
        const agent = parseUserAgent(client.headers['user-agent'], config.allowHeadless);
        if(agent.isBot && body.sessionId !== undefined) return { accepted: 0 };

        const receivedAt = Date.now();
        const skew = receivedAt - body.sentAt;
        const pageHost = hostOf(client.headers.origin ?? client.headers.referer);
        const geo = await this.#geo.locate(client.ip, client.headers);

        await this.#batches.add({
            projectId: project.projectId,
            receivedAt,
            anonymousId: body.anonymousId,
            userId: body.userId ?? null,
            sessionId: body.sessionId ?? null,
            sdk: `${body.sdk.name}@${body.sdk.version}`,
            context: contextOf(body.context, agent, geo),
            events: body.events.map((event) => eventOf(event, skew, project, pageHost))
        });

        return { accepted: body.events.length };
    }

    async replay(body: WireReplayChunk): Promise<IngestReceipt>{
        const project = await projectDirectory.resolve(body.key);
        if(!project.settings.recordingEnabled) throw IngestError.Disabled();

        const receivedAt = Date.now();
        const skew = receivedAt - body.sentAt;
        const storageKey = replayStorageKey(project.projectId, body.sessionId, body.seq);
        const compressed = await compress(JSON.stringify(body.events));
        const timestamps = timestampsOf(body.events);
        const first = timestamps.reduce((min, timestamp) => Math.min(min, timestamp), timestamps[0] ?? body.sentAt);
        const last = timestamps.reduce((max, timestamp) => Math.max(max, timestamp), timestamps[0] ?? body.sentAt);

        await objectStorage.put(storageKey, compressed, REPLAY_CONTENT_TYPE);
        await this.#replays.add({
            projectId: project.projectId,
            sessionId: body.sessionId,
            seq: body.seq,
            storageKey,
            size: compressed.length,
            eventCount: body.events.length,
            firstTimestamp: first + skew,
            lastTimestamp: last + skew,
            hasFullSnapshot: body.events.some((event) => recorded(event).type === FULL_SNAPSHOT),
            receivedAt
        });

        return { accepted: body.events.length };
    }

    async script(): Promise<RawResponse>{
        try{
            return new RawResponse(await readFile(config.sdkScriptPath), SCRIPT_CONTENT_TYPE);
        }catch(error){
            if((error as NodeJS.ErrnoException).code === MISSING_FILE) throw ScriptError.Missing();
            throw error;
        }
    }
}
