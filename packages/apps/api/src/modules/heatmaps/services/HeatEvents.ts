import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { HeatScope } from '../contracts/domain/heatmap';

const TABLET_FROM_PX = 768;
const DESKTOP_FROM_PX = 1100;
const SCOPE_PARAMS = 6;

export default class HeatEvents{
    query<R>(scope: HeatScope, select: string, extra: unknown[] = []): Promise<R[]>{
        const manager = Event.getRepository().manager;
        const events = tableRef(manager, Event);
        const sessions = tableRef(manager, Session);

        return manager.query<R[]>(`
            WITH scoped AS (
                SELECT
                    e.type, e."sessionId", e.timestamp, e.x, e.y, e."documentHeight", e.selector, e.text,
                    e.rage, e.dead, e.value,
                    COALESCE(e."viewportWidth", s."viewportWidth") AS width
                FROM ${events.table} e
                LEFT JOIN ${sessions.table} s ON s.id = e."sessionId"
                WHERE e."projectId" = $1
                    AND e.path = $2
                    AND e.timestamp >= $3
                    AND e.type IN ('pageview', 'pageleave', 'click')
                    AND CASE
                        WHEN COALESCE(e."viewportWidth", s."viewportWidth") < $5 THEN 'mobile'
                        WHEN COALESCE(e."viewportWidth", s."viewportWidth") < $6 THEN 'tablet'
                        ELSE 'desktop'
                    END = $4
            )
            ${select}
        `, [scope.projectId, scope.path, scope.from, scope.width, TABLET_FROM_PX, DESKTOP_FROM_PX, ...extra]);
    }

    param(index: number): string{
        return `$${SCOPE_PARAMS + index}`;
    }
}
