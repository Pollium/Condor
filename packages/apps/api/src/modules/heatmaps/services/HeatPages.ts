import Project from '@/modules/projects/models/Project';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { HeatPage } from '@condor/contracts/heatmaps/domain';
import { Period } from '@condor/contracts/shared/period';
import { resolveWindow } from '@/shared/time/period-window';

const PAGE_LIMIT = 50;

interface PageRow{
    path: string;
    title: string | null;
    views: string;
    clicks: string;
}

export default class HeatPagesService{
    async list(project: Project, period: Period): Promise<HeatPage[]>{
        const manager = Event.getRepository().manager;
        const events = tableRef(manager, Event);
        const window = await resolveWindow(manager, period, project.settings.timezone);

        const rows = await manager.query<PageRow[]>(`
            SELECT
                e.path,
                (array_agg(e.title ORDER BY e.timestamp DESC) FILTER (WHERE e.type = 'pageview' AND e.title IS NOT NULL))[1] AS title,
                COUNT(*) FILTER (WHERE e.type = 'pageview') AS views,
                COUNT(*) FILTER (WHERE e.type = 'click') AS clicks
            FROM ${events.table} e
            WHERE e."projectId" = $1 AND e.type IN ('pageview', 'click') AND e.timestamp >= $2
            GROUP BY e.path
            ORDER BY clicks DESC, views DESC, e.path
            LIMIT $3
        `, [project.id, window.from, PAGE_LIMIT]);

        return rows.map((row) => ({
            path: row.path,
            title: row.title,
            views: Number(row.views),
            clicks: Number(row.clicks)
        }));
    }
}
