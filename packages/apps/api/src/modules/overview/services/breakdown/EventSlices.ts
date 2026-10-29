import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import RankedSlices from './RankedSlices';
import { BreakdownScope, BreakdownSlices } from '../../contracts/domain/breakdown';

export default class EventSlices{
    #ranked = new RankedSlices();

    read(scope: BreakdownScope): Promise<BreakdownSlices>{
        const manager = Event.getRepository().manager;
        const events = tableRef(manager, Event);
        const sessions = tableRef(manager, Session);

        return this.#ranked.read({
            source: `
                SELECT e.name, s."personKey"
                FROM ${events.table} e
                LEFT JOIN ${sessions.table} s ON s.id = e."sessionId"
                WHERE e."projectId" = $1 AND e.type = 'custom' AND e.timestamp >= $2
            `,
            ranked: `
                SELECT
                    name AS id,
                    name AS label,
                    NULL::text AS detail,
                    COUNT(*) AS value,
                    COUNT(DISTINCT "personKey") AS secondary
                FROM scoped
                GROUP BY name
                ORDER BY value DESC, name
                LIMIT $3
            `
        }, scope);
    }
}
