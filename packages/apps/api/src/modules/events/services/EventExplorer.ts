import Project from '@/modules/projects/models/Project';
import Person from '@/modules/sessions/models/Person';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { EventDetail, EventProperty, EventSummary, PropertyBreakdown } from '@condor/contracts/events/domain';
import { Period } from '@condor/contracts/shared/period';
import { Segment } from '@condor/contracts/shared/segment';
import { BUCKET_FORMAT, seriesOf } from '@/shared/time/bucket-series';
import { PeriodWindow, resolveWindow } from '@/shared/time/period-window';

const EVENT_LIMIT = 200;
const PROPERTY_LIMIT = 50;
const VALUE_LIMIT = 20;

export interface ExplorerFilter{
    period: Period;
    segment: Segment | null;
}

interface SummaryRow{
    name: string;
    count: string;
    previousCount: string;
    people: string;
    lastSeenAt: Date;
}

interface BucketRow{
    bucket: string;
    count: string;
}

interface PropertyRow{
    key: string;
    count: string;
}

interface ValueRow{
    value: string;
    count: string;
    people: string;
    total: string;
}

export default class EventExplorerService{
    async list(project: Project, filter: ExplorerFilter): Promise<EventSummary[]>{
        const { window, query } = await this.#scope(project, filter);
        const rows = await query<SummaryRow>(`
            SELECT e.name,
                COUNT(*) FILTER (WHERE e.timestamp >= $2) AS count,
                COUNT(*) FILTER (WHERE e.timestamp < $2) AS "previousCount",
                COUNT(DISTINCT e."personId") FILTER (WHERE e.timestamp >= $2) AS people,
                MAX(e.timestamp) AS "lastSeenAt"
            FROM %events% e %segment%
            WHERE e."projectId" = $1 AND e.type = 'custom' AND e.timestamp >= $3
            GROUP BY e.name
            ORDER BY count DESC, e.name
            LIMIT ${EVENT_LIMIT}
        `, [window.from, window.previousFrom]);

        return rows.map((row) => ({
            name: row.name,
            count: Number(row.count),
            previousCount: Number(row.previousCount),
            people: Number(row.people),
            lastSeenAt: row.lastSeenAt.toISOString()
        }));
    }

    async detail(project: Project, name: string, filter: ExplorerFilter): Promise<EventDetail>{
        const { window, query } = await this.#scope(project, filter);
        const [totals, buckets, properties] = await Promise.all([
            query<SummaryRow>(`
                SELECT COUNT(*) FILTER (WHERE e.timestamp >= $3) AS count,
                    COUNT(*) FILTER (WHERE e.timestamp < $3) AS "previousCount",
                    COUNT(DISTINCT e."personId") FILTER (WHERE e.timestamp >= $3) AS people
                FROM %events% e %segment%
                WHERE e."projectId" = $1 AND e.type = 'custom' AND e.name = $2 AND e.timestamp >= $4
            `, [name, window.from, window.previousFrom]),
            query<BucketRow>(`
                SELECT to_char(date_trunc($3, e.timestamp AT TIME ZONE $4), '${BUCKET_FORMAT}') AS bucket, COUNT(*) AS count
                FROM %events% e %segment%
                WHERE e."projectId" = $1 AND e.type = 'custom' AND e.name = $2 AND e.timestamp >= $5
                GROUP BY 1
            `, [name, window.grain, window.timezone, window.from]),
            query<PropertyRow>(`
                SELECT prop.key, COUNT(*) AS count
                FROM %events% e %segment%, jsonb_object_keys(e.props) AS prop(key)
                WHERE e."projectId" = $1 AND e.type = 'custom' AND e.name = $2 AND e.timestamp >= $3
                GROUP BY prop.key
                ORDER BY count DESC, prop.key
                LIMIT ${PROPERTY_LIMIT}
            `, [name, window.from])
        ]);
        const [total] = totals;

        return {
            name,
            period: filter.period,
            count: Number(total?.count ?? 0),
            previousCount: Number(total?.previousCount ?? 0),
            people: Number(total?.people ?? 0),
            series: this.#series(window, buckets),
            properties: properties.map((row): EventProperty => ({ key: row.key, count: Number(row.count) }))
        };
    }

    async property(project: Project, name: string, key: string, filter: ExplorerFilter): Promise<PropertyBreakdown>{
        const { window, query } = await this.#scope(project, filter);
        const rows = await query<ValueRow>(`
            SELECT e.props ->> $3 AS value, COUNT(*) AS count, COUNT(DISTINCT e."personId") AS people,
                SUM(COUNT(*)) OVER () AS total
            FROM %events% e %segment%
            WHERE e."projectId" = $1 AND e.type = 'custom' AND e.name = $2 AND e.timestamp >= $4
                AND e.props ? $3
            GROUP BY 1
            ORDER BY count DESC, value
            LIMIT ${VALUE_LIMIT}
        `, [name, key, window.from]);

        return {
            key,
            total: Number(rows[0]?.total ?? 0),
            values: rows.map((row) => ({ value: row.value, count: Number(row.count), people: Number(row.people) }))
        };
    }

    #series(window: PeriodWindow, rows: BucketRow[]){
        const counts = seriesOf(window.buckets, rows, (row) => Number(row.count));
        return window.buckets.map((label, index) => ({ label, count: counts[index] }));
    }

    async #scope(project: Project, filter: ExplorerFilter){
        const manager = Event.getRepository().manager;
        const window = await resolveWindow(manager, filter.period, project.settings.timezone);
        const events = tableRef(manager, Event).table;
        const people = tableRef(manager, Person).table;
        const segment = filter.segment;

        const query = <R>(sql: string, parameters: unknown[]): Promise<R[]> => {
            const next = parameters.length + 2;
            const join = segment === null
                ? ''
                : `JOIN ${people} member ON member.id = e."personId" AND member.traits ->> $${next}::text = $${next + 1}::text`;
            return manager.query<R[]>(
                sql.replace('%events%', events).replace('%segment%', join),
                [project.id, ...parameters, ...(segment === null ? [] : [segment.key, segment.value])]
            );
        };

        return { window, query };
    }
}
