import Person from '../models/Person';
import Session from '../models/Session';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { SessionSummary } from '@condor/contracts/sessions/domain';
import { config } from '@/shared/config';
import { In } from 'typeorm';

const ACTIVITY_BUCKETS = 28;
const DENSITY_PRECISION = 100;

interface BucketRow{
    sessionId: string;
    bucket: number;
    count: number;
}

export default class SessionSummariesService{
    async of(sessions: Session[]): Promise<SessionSummary[]>{
        if(sessions.length === 0) return [];

        const [people, activity] = await Promise.all([this.#people(sessions), this.#activity(sessions)]);
        const liveSince = Date.now() - config.liveWindowMs;

        return sessions.map((session) => this.#summary(
            session,
            people.get(session.personId),
            activity.get(session.id) ?? this.#emptyActivity(),
            session.endedAt.getTime() >= liveSince
        ));
    }

    #summary(session: Session, person: Person | undefined, activity: number[], live: boolean): SessionSummary{
        return {
            id: session.id,
            personId: session.personId,
            anonymousId: session.anonymousId,
            userId: session.userId,
            name: person?.name ?? null,
            email: person?.email ?? null,
            startedAt: session.startedAt.toISOString(),
            endedAt: session.endedAt.toISOString(),
            duration: session.duration,
            activeDuration: session.activeDuration,
            pageviews: session.pageviews,
            events: session.events,
            country: session.country,
            city: session.city,
            device: session.device,
            os: session.os,
            browser: session.browser,
            entryPath: session.entryPath,
            exitPath: session.exitPath,
            currentPath: live ? session.exitPath : null,
            channel: session.channel,
            source: session.source,
            release: session.release,
            signals: {
                rage: session.rageClicks,
                dead: session.deadClicks,
                errors: session.errors,
                uturns: session.uturns
            },
            converted: session.converted,
            hasReplay: session.hasReplay,
            live,
            activity
        };
    }

    async #people(sessions: Session[]): Promise<Map<string, Person>>{
        const people = await Person.findBy({ id: In([...new Set(sessions.map((session) => session.personId))]) });

        return new Map(people.map((person) => [person.id, person]));
    }

    async #activity(sessions: Session[]): Promise<Map<string, number[]>>{
        const manager = Event.getRepository().manager;
        const rows = await manager.query<BucketRow[]>(`
            SELECT event."sessionId" AS "sessionId",
                LEAST($2::int - 1, GREATEST(0, FLOOR(
                    $2::int * EXTRACT(EPOCH FROM event."timestamp" - session."startedAt")
                    / GREATEST(EXTRACT(EPOCH FROM session."endedAt" - session."startedAt"), 1)
                )))::int AS bucket,
                COUNT(*)::int AS count
            FROM ${tableRef(manager, Event).table} AS event
            JOIN ${tableRef(manager, Session).table} AS session ON session.id = event."sessionId"
            WHERE event."sessionId" = ANY($1::uuid[])
            GROUP BY 1, 2
        `, [sessions.map((session) => session.id), ACTIVITY_BUCKETS]);

        const counts = new Map<string, number[]>();
        for(const row of rows){
            const buckets = counts.get(row.sessionId) ?? this.#emptyActivity();
            buckets[row.bucket] = row.count;
            counts.set(row.sessionId, buckets);
        }

        return new Map([...counts].map(([sessionId, buckets]) => [sessionId, this.#density(buckets)]));
    }

    #emptyActivity(): number[]{
        return Array.from({ length: ACTIVITY_BUCKETS }, () => 0);
    }

    #density(buckets: number[]): number[]{
        const peak = Math.max(...buckets);

        return buckets.map((count) => Math.round(count / peak * DENSITY_PRECISION) / DENSITY_PRECISION);
    }
}
