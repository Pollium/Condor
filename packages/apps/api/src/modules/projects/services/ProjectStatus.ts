import Project from '../models/Project';
import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { ProjectStatus } from '@condor/contracts/projects/domain';

interface TodayRow{
    events: number;
    sessions: number;
    replays: number;
}

export default class ProjectStatusService{
    async of(project: Project): Promise<ProjectStatus>{
        const manager = Project.getRepository().manager;
        const events = tableRef(manager, Event).table;
        const sessions = tableRef(manager, Session).table;

        const [today] = await manager.query<TodayRow[]>(`
            WITH today AS (
                SELECT date_trunc('day', now() AT TIME ZONE $2) AT TIME ZONE $2 AS start
            )
            SELECT
                (SELECT COUNT(*)::int FROM ${events} WHERE "projectId" = $1 AND "timestamp" >= today.start) AS events,
                (SELECT COUNT(*)::int FROM ${sessions} WHERE "projectId" = $1 AND "startedAt" >= today.start) AS sessions,
                (SELECT COUNT(*)::int FROM ${sessions} WHERE "projectId" = $1 AND "startedAt" >= today.start AND "hasReplay") AS replays
            FROM today
        `, [project.id, project.settings.timezone]);

        return {
            lastEventAt: project.lastEventAt?.toISOString() ?? null,
            eventsToday: today.events,
            sessionsToday: today.sessions,
            replaysToday: today.replays
        };
    }
}
