import Project from '@/modules/projects/models/Project';
import Session from '@/modules/sessions/models/Session';
import { tableRef } from '@readable/utils/models/table-ref';
import { HourCell } from '@condor/contracts/overview/domain';
import { Period } from '@condor/contracts/shared/period';
import { resolveWindow } from '@/shared/time/period-window';

interface HourRow{
    weekday: number;
    hour: number;
    sessions: string;
}

export default class HoursService{
    async read(project: Project, period: Period): Promise<HourCell[]>{
        const manager = Session.getRepository().manager;
        const sessions = tableRef(manager, Session);
        const window = await resolveWindow(manager, period, project.settings.timezone);

        const rows = await manager.query<HourRow[]>(`
            SELECT
                EXTRACT(ISODOW FROM s."startedAt" AT TIME ZONE $3)::int AS weekday,
                EXTRACT(HOUR FROM s."startedAt" AT TIME ZONE $3)::int AS hour,
                COUNT(*) AS sessions
            FROM ${sessions.table} s
            WHERE s."projectId" = $1 AND s."startedAt" >= $2
            GROUP BY 1, 2
            ORDER BY 1, 2
        `, [project.id, window.from, window.timezone]);

        return rows.map((row) => ({
            weekday: row.weekday,
            hour: row.hour,
            sessions: Number(row.sessions)
        }));
    }
}
