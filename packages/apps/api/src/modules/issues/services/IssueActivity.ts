import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { BUCKET_FORMAT, seriesOf } from '@/shared/time/bucket-series';
import { PeriodWindow } from '@/shared/time/period-window';
import { IssueActivity } from '../contracts/domain/issue';

const RECENT_SESSIONS = 10;

interface ActivityRow{
    issueId: string;
    total: boolean;
    bucket: string;
    events: string;
    sessions: string;
    people: string;
}

interface SessionRow{
    id: string;
}

export default class IssueActivityQuery{
    async inWindow(projectId: string, issueIds: string[], window: PeriodWindow): Promise<Map<string, IssueActivity>>{
        const manager = Event.getRepository().manager;
        const events = tableRef(manager, Event);
        const sessions = tableRef(manager, Session);

        const rows = await manager.query<ActivityRow[]>(`
            SELECT
                "issueId",
                GROUPING(bucket) = 1 AS total,
                bucket,
                COUNT(*) AS events,
                COUNT(DISTINCT "sessionId") AS sessions,
                COUNT(DISTINCT "personKey") AS people
            FROM (
                SELECT
                    e.name AS "issueId",
                    e."sessionId",
                    s."personKey",
                    to_char(date_trunc($4, e.timestamp AT TIME ZONE $5), $6) AS bucket
                FROM ${events.table} e
                LEFT JOIN ${sessions.table} s ON s.id = e."sessionId"
                WHERE e."projectId" = $1 AND e.type = 'error' AND e.name = ANY($2::text[]) AND e.timestamp >= $3
            ) scoped
            GROUP BY GROUPING SETS (("issueId", bucket), ("issueId"))
        `, [projectId, issueIds, window.from, window.grain, window.timezone, BUCKET_FORMAT]);

        return new Map(issueIds.map((issueId) => [issueId, this.#activity(rows, issueId, window)]));
    }

    async recentSessions(projectId: string, issueId: string): Promise<string[]>{
        const manager = Event.getRepository().manager;
        const events = tableRef(manager, Event);
        const sessions = tableRef(manager, Session);

        const rows = await manager.query<SessionRow[]>(`
            SELECT s.id
            FROM (
                SELECT e."sessionId", MAX(e.timestamp) AS "lastAt"
                FROM ${events.table} e
                WHERE e."projectId" = $1 AND e.type = 'error' AND e.name = $2 AND e."sessionId" IS NOT NULL
                GROUP BY e."sessionId"
            ) hits
            JOIN ${sessions.table} s ON s.id = hits."sessionId"
            ORDER BY s."hasReplay" DESC, hits."lastAt" DESC
            LIMIT $3
        `, [projectId, issueId, RECENT_SESSIONS]);

        return rows.map((row) => row.id);
    }

    #activity(rows: ActivityRow[], issueId: string, window: PeriodWindow): IssueActivity{
        const own = rows.filter((row) => row.issueId === issueId);
        const total = own.find((row) => row.total);

        return {
            sessions: Number(total?.sessions ?? 0),
            people: Number(total?.people ?? 0),
            trend: seriesOf(window.buckets, own.filter((row) => !row.total), (row) => Number(row.events))
        };
    }
}
