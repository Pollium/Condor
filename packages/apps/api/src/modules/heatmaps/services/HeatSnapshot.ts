import HeatEvents from './HeatEvents';
import ReplayChunk from '@/modules/sessions/models/ReplayChunk';
import { tableRef } from '@readable/utils/models/table-ref';
import { HeatSnapshot } from '@condor/contracts/heatmaps/domain';
import { HeatScope } from '../contracts/domain/heatmap';

interface SnapshotRow{
    sessionId: string;
    timestamp: Date;
}

export default class HeatSnapshotService{
    #events = new HeatEvents();

    async latest(scope: HeatScope): Promise<HeatSnapshot | null>{
        const chunks = tableRef(ReplayChunk.getRepository().manager, ReplayChunk).table;

        const [row] = await this.#events.query<SnapshotRow>(scope, `
            SELECT visit."sessionId", GREATEST(visit.timestamp, snapshot."firstAt") + INTERVAL '500 milliseconds' AS timestamp
            FROM scoped visit
            CROSS JOIN LATERAL (
                SELECT chunk."firstAt"
                FROM ${chunks} chunk
                WHERE chunk."sessionId" = visit."sessionId"
                    AND chunk."hasFullSnapshot"
                    AND chunk."firstAt" <= visit.timestamp + INTERVAL '10 seconds'
                ORDER BY chunk."firstAt" DESC
                LIMIT 1
            ) snapshot
            WHERE visit.type = 'pageview'
                AND EXISTS (
                    SELECT 1 FROM ${chunks} chunk
                    WHERE chunk."sessionId" = visit."sessionId" AND chunk."lastAt" >= visit.timestamp
                )
            ORDER BY visit.timestamp DESC
            LIMIT 1
        `);
        if(row === undefined) return null;

        return {
            sessionId: row.sessionId,
            timestamp: row.timestamp.getTime()
        };
    }
}
