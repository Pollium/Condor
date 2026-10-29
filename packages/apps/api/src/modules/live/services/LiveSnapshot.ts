import Session from '@/modules/sessions/models/Session';
import { tableRef } from '@readable/utils/models/table-ref';
import { LivePage, LiveSnapshot } from '@condor/contracts/overview/domain';
import { config } from '@/shared/config';

const TOP_PAGES = 8;

interface CountRow{
    count: number;
}

export default class LiveSnapshotService{
    async of(projectId: string): Promise<LiveSnapshot>{
        const manager = Session.getRepository().manager;
        const sessions = tableRef(manager, Session).table;
        const since = new Date(Date.now() - config.liveWindowMs);

        const [[active], pages] = await Promise.all([
            manager.query<CountRow[]>(`
                SELECT COUNT(DISTINCT "personKey")::int AS count
                FROM ${sessions}
                WHERE "projectId" = $1 AND "endedAt" >= $2
            `, [projectId, since]),
            manager.query<LivePage[]>(`
                SELECT "exitPath" AS path, COUNT(DISTINCT "personKey")::int AS people
                FROM ${sessions}
                WHERE "projectId" = $1 AND "endedAt" >= $2 AND "exitPath" IS NOT NULL
                GROUP BY "exitPath"
                ORDER BY people DESC, path ASC
                LIMIT $3
            `, [projectId, since, TOP_PAGES])
        ]);

        return {
            count: active.count,
            pages
        };
    }
}
