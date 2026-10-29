import Project from '@/modules/projects/models/Project';
import Session from '@/modules/sessions/models/Session';
import { tableRef } from '@readable/utils/models/table-ref';
import { Engagement } from '@condor/contracts/overview/domain';
import { Period } from '@condor/contracts/shared/period';
import { resolveWindow } from '@/shared/time/period-window';

type EngagementRow = Record<keyof Engagement, string>;

export default class EngagementService{
    async read(project: Project, period: Period): Promise<Engagement>{
        const manager = Session.getRepository().manager;
        const sessions = tableRef(manager, Session);
        const window = await resolveWindow(manager, period, project.settings.timezone);

        const [row] = await manager.query<EngagementRow[]>(`
            SELECT
                COALESCE(AVG(s."activeDuration"), 0) AS "activeSeconds",
                COALESCE(SUM(s."activeDuration")::float8 / NULLIF(SUM(s.duration), 0), 0) AS "activeShare",
                COALESCE(AVG(s."scrollDepth"), 0) AS "scrollDepth",
                COALESCE(AVG(s.clicks), 0) AS "clicksPerSession",
                COALESCE(SUM(s."rageClicks") * 100.0 / NULLIF(SUM(s.clicks), 0), 0) AS "ragePer100",
                COALESCE(COUNT(*)::float8 / NULLIF(COUNT(DISTINCT s."personKey"), 0), 0) AS "sessionsPerPerson"
            FROM ${sessions.table} s
            WHERE s."projectId" = $1 AND s."startedAt" >= $2
        `, [project.id, window.from]);

        return {
            activeSeconds: Number(row.activeSeconds),
            activeShare: Number(row.activeShare),
            scrollDepth: Number(row.scrollDepth),
            clicksPerSession: Number(row.clicksPerSession),
            ragePer100: Number(row.ragePer100),
            sessionsPerPerson: Number(row.sessionsPerPerson)
        };
    }
}
