import ReplayTotalsService from './ReplayTotals';
import Person from '@/modules/sessions/models/Person';
import Session from '@/modules/sessions/models/Session';
import { tableRef } from '@readable/utils/models/table-ref';
import { IngestBatchJob } from '@/modules/tracking/contracts/domain/queue';
import { SessionBatch, SessionTally } from '../contracts/domain/ingest';
import { config } from '@/shared/config';
import { EntityManager } from 'typeorm';

export default class SessionWriterService{
    #replays = new ReplayTotalsService();

    async write(manager: EntityManager, job: IngestBatchJob, person: Person, tally: SessionTally){
        const { sessionId } = job;
        if(sessionId === null) return;

        const batch: SessionBatch = { ...job, sessionId };
        await this.#replays.lock(manager, sessionId);
        if(await this.#open(manager, batch, person, tally)){
            await manager.increment(Person, { id: person.id }, 'sessions', 1);
            await this.#replays.refresh(manager, batch.projectId, sessionId);
        }

        await this.#extend(manager, batch, tally);
    }

    async live(manager: EntityManager, job: IngestBatchJob, person: Person): Promise<string | null>{
        const since = Math.min(...job.events.map((event) => event.timestamp)) - config.sessionGapMs;
        const [session] = await manager.query<Pick<Session, 'id'>[]>(`
            SELECT id FROM ${tableRef(manager, Session).table}
            WHERE "projectId" = $1 AND "personKey" = $2 AND "endedAt" >= $3
            ORDER BY "endedAt" DESC
            LIMIT 1
        `, [job.projectId, person.userId ?? person.anonymousId, new Date(since)]);

        return session?.id ?? null;
    }

    async touch(manager: EntityManager, job: IngestBatchJob){
        if(job.sessionId === null) return;

        await manager.query(`
            UPDATE ${tableRef(manager, Session).table} SET
                "endedAt" = GREATEST("endedAt", $3::timestamptz),
                duration = EXTRACT(EPOCH FROM GREATEST("endedAt", $3::timestamptz) - "startedAt")::int,
                "updatedAt" = now()
            WHERE id = $1 AND "projectId" = $2
        `, [job.sessionId, job.projectId, new Date(job.receivedAt)]);
    }

    async #open(manager: EntityManager, batch: SessionBatch, person: Person, tally: SessionTally): Promise<boolean>{
        const { context } = batch;
        const attribution = tally.attribution;

        const result = await manager.createQueryBuilder()
            .insert()
            .into(Session)
            .values({
                id: batch.sessionId,
                projectId: batch.projectId,
                personId: person.id,
                personKey: person.userId ?? person.anonymousId,
                anonymousId: person.anonymousId,
                userId: person.userId,
                startedAt: tally.firstAt,
                endedAt: tally.firstAt,
                channel: attribution?.channel ?? 'direct',
                source: attribution?.source ?? null,
                referrer: attribution?.referrer ?? null,
                referrerHost: attribution?.referrerHost ?? null,
                utmSource: attribution?.utmSource ?? null,
                utmMedium: attribution?.utmMedium ?? null,
                utmCampaign: attribution?.utmCampaign ?? null,
                country: context.country,
                region: context.region,
                city: context.city,
                language: context.language,
                timezone: context.timezone,
                os: context.os,
                osVersion: context.osVersion,
                browser: context.browser,
                browserVersion: context.browserVersion,
                device: context.device,
                screenWidth: context.screenWidth,
                screenHeight: context.screenHeight,
                viewportWidth: context.viewportWidth,
                connection: context.connection,
                release: context.release,
                sdk: batch.sdk,
                sequence: person.sessions + 1
            })
            .orIgnore()
            .returning('id')
            .updateEntity(false)
            .execute();

        return (result.raw as unknown[]).length > 0;
    }

    async #extend(manager: EntityManager, batch: SessionBatch, tally: SessionTally){
        await manager.query(`
            UPDATE ${tableRef(manager, Session).table} SET
                "startedAt" = LEAST("startedAt", $3::timestamptz),
                "endedAt" = GREATEST("endedAt", $4::timestamptz),
                duration = EXTRACT(EPOCH FROM GREATEST("endedAt", $4::timestamptz) - LEAST("startedAt", $3::timestamptz))::int,
                events = events + $5,
                pageviews = pageviews + $6,
                clicks = clicks + $7,
                "rageClicks" = "rageClicks" + $8,
                "deadClicks" = "deadClicks" + $9,
                errors = errors + $10,
                uturns = uturns + $11,
                "activeDuration" = "activeDuration" + $12,
                "scrollDepth" = GREATEST("scrollDepth", $13),
                "entryPath" = COALESCE("entryPath", $14),
                "exitPath" = CASE
                    WHEN $15::timestamptz IS NOT NULL AND ("exitPath" IS NULL OR $15::timestamptz >= "endedAt") THEN $16
                    ELSE "exitPath"
                END,
                converted = converted OR $17,
                "updatedAt" = now()
            WHERE id = $1 AND "projectId" = $2
        `, [
            batch.sessionId,
            batch.projectId,
            tally.firstAt,
            tally.lastAt,
            tally.events,
            tally.pageviews,
            tally.clicks,
            tally.rageClicks,
            tally.deadClicks,
            tally.errors,
            tally.uturns,
            tally.activeSeconds,
            tally.scrollDepth,
            tally.entryPath,
            tally.exitAt,
            tally.exitPath,
            tally.converted
        ]);
    }
}
