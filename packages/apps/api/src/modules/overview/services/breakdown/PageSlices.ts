import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import RankedSlices from './RankedSlices';
import { BreakdownScope, BreakdownSlices, LandingDimension } from '../../contracts/domain/breakdown';

const LANDING_COLUMNS: Record<LandingDimension, string> = {
    entry: 's."entryPath"',
    exit: 's."exitPath"'
};

export default class PageSlices{
    #ranked = new RankedSlices();

    views(scope: BreakdownScope): Promise<BreakdownSlices>{
        const events = tableRef(Event.getRepository().manager, Event);

        return this.#ranked.read({
            source: `
                SELECT e.path, e.title, e.timestamp
                FROM ${events.table} e
                WHERE e."projectId" = $1 AND e.type = 'pageview' AND e.timestamp >= $2
            `,
            ranked: `
                SELECT
                    path AS id,
                    path AS label,
                    (array_agg(title ORDER BY timestamp DESC) FILTER (WHERE title IS NOT NULL))[1] AS detail,
                    COUNT(*) AS value,
                    NULL::bigint AS secondary
                FROM scoped
                GROUP BY path
                ORDER BY value DESC, path
                LIMIT $3
            `
        }, scope);
    }

    landing(scope: BreakdownScope, dimension: LandingDimension): Promise<BreakdownSlices>{
        const manager = Session.getRepository().manager;
        const sessions = tableRef(manager, Session);
        const events = tableRef(manager, Event);

        return this.#ranked.read({
            source: `
                SELECT ${LANDING_COLUMNS[dimension]} AS path
                FROM ${sessions.table} s
                WHERE s."projectId" = $1 AND s."startedAt" >= $2
            `,
            ranked: `
                SELECT
                    top.path AS id,
                    top.path AS label,
                    NULL::text AS detail,
                    top.value,
                    (
                        SELECT COUNT(*)
                        FROM ${events.table} e
                        WHERE e."projectId" = $1 AND e.path = top.path AND e.type = 'pageview' AND e.timestamp >= $2
                    ) AS secondary
                FROM (
                    SELECT path, COUNT(*) AS value
                    FROM scoped
                    WHERE path IS NOT NULL
                    GROUP BY path
                    ORDER BY value DESC, path
                    LIMIT $3
                ) top
            `
        }, scope);
    }
}
