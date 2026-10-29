import Project from '@/modules/projects/models/Project';
import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { AudiencePoint, Kpi, KpiKey, Summary } from '@condor/contracts/overview/domain';
import { Period } from '@condor/contracts/shared/period';
import { BUCKET_FORMAT, seriesOf } from '@/shared/time/bucket-series';
import { PeriodWindow, resolveWindow } from '@/shared/time/period-window';

type SessionKpi = Exclude<KpiKey, 'errors'>;

const SESSION_KPIS: SessionKpi[] = ['sessions', 'people', 'duration', 'bounce', 'frustrated'];

interface PeriodRow{
    total: boolean;
    current: boolean;
    bucket: string;
}

interface SessionRow extends PeriodRow, Record<SessionKpi, string>{
    fresh: string;
    returning: string;
    pageviews: string;
}

interface ErrorRow extends PeriodRow{
    errors: string;
}

interface PeriodRows<R>{
    current: R | undefined;
    previous: R | undefined;
    buckets: R[];
}

export default class SummaryService{
    async read(project: Project, period: Period): Promise<Summary>{
        const manager = Session.getRepository().manager;
        const window = await resolveWindow(manager, period, project.settings.timezone);
        const [sessions, errors] = await Promise.all([
            this.#sessions(project, window),
            this.#errors(project, window)
        ]);

        const kpis: Kpi[] = SESSION_KPIS.map((key) => ({
            key,
            value: Number(sessions.current?.[key] ?? 0),
            previous: Number(sessions.previous?.[key] ?? 0),
            series: seriesOf(window.buckets, sessions.buckets, (row) => Number(row[key]))
        }));
        kpis.push({
            key: 'errors',
            value: Number(errors.current?.errors ?? 0),
            previous: Number(errors.previous?.errors ?? 0),
            series: seriesOf(window.buckets, errors.buckets, (row) => Number(row.errors))
        });

        return {
            period,
            buckets: window.buckets,
            kpis,
            audience: this.#audience(window, sessions.buckets),
            pageviews: Number(sessions.current?.pageviews ?? 0)
        };
    }

    #audience(window: PeriodWindow, rows: SessionRow[]): AudiencePoint[]{
        const fresh = seriesOf(window.buckets, rows, (row) => Number(row.fresh));
        const returning = seriesOf(window.buckets, rows, (row) => Number(row.returning));

        return fresh.map((count, index) => ({
            fresh: count,
            returning: returning[index]
        }));
    }

    async #sessions(project: Project, window: PeriodWindow): Promise<PeriodRows<SessionRow>>{
        const manager = Session.getRepository().manager;
        const sessions = tableRef(manager, Session);

        const rows = await manager.query<SessionRow[]>(`
            SELECT
                GROUPING(bucket) = 1 AS total,
                current,
                bucket,
                COUNT(*) AS sessions,
                COUNT(DISTINCT "personKey") AS people,
                AVG(duration) AS duration,
                AVG((pageviews <= 1)::int) AS bounce,
                AVG(("rageClicks" > 0 OR "deadClicks" > 0 OR errors > 0)::int) AS frustrated,
                COUNT(*) FILTER (WHERE sequence = 1) AS fresh,
                COUNT(*) FILTER (WHERE sequence > 1) AS returning,
                SUM(pageviews) AS pageviews
            FROM (
                SELECT
                    s."personKey", s.duration, s.pageviews, s."rageClicks", s."deadClicks", s.errors, s.sequence,
                    s."startedAt" >= $3 AS current,
                    to_char(date_trunc($4, s."startedAt" AT TIME ZONE $5), $6) AS bucket
                FROM ${sessions.table} s
                WHERE s."projectId" = $1 AND s."startedAt" >= $2
            ) scoped
            GROUP BY GROUPING SETS ((current, bucket), (current))
        `, [project.id, window.previousFrom, window.from, window.grain, window.timezone, BUCKET_FORMAT]);

        return this.#split(rows);
    }

    async #errors(project: Project, window: PeriodWindow): Promise<PeriodRows<ErrorRow>>{
        const manager = Event.getRepository().manager;
        const events = tableRef(manager, Event);

        const rows = await manager.query<ErrorRow[]>(`
            SELECT GROUPING(bucket) = 1 AS total, current, bucket, COUNT(*) AS errors
            FROM (
                SELECT
                    e.timestamp >= $3 AS current,
                    to_char(date_trunc($4, e.timestamp AT TIME ZONE $5), $6) AS bucket
                FROM ${events.table} e
                WHERE e."projectId" = $1 AND e.type = 'error' AND e.timestamp >= $2
            ) scoped
            GROUP BY GROUPING SETS ((current, bucket), (current))
        `, [project.id, window.previousFrom, window.from, window.grain, window.timezone, BUCKET_FORMAT]);

        return this.#split(rows);
    }

    #split<R extends PeriodRow>(rows: R[]): PeriodRows<R>{
        return {
            current: rows.find((row) => row.total && row.current),
            previous: rows.find((row) => row.total && !row.current),
            buckets: rows.filter((row) => !row.total && row.current)
        };
    }
}
