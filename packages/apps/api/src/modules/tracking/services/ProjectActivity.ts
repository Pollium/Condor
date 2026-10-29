import Project from '@/modules/projects/models/Project';
import { tableRef } from '@readable/utils/models/table-ref';

const TOUCH_INTERVAL_MS = 60_000;

export default class ProjectActivityService{
    #touchedAt = new Map<string, number>();

    async touch(projectId: string, at: Date){
        const last = this.#touchedAt.get(projectId);
        if(last !== undefined && at.getTime() - last < TOUCH_INTERVAL_MS) return;

        this.#touchedAt.set(projectId, at.getTime());
        const manager = Project.getRepository().manager;
        await manager.query(`
            UPDATE ${tableRef(manager, Project).table}
            SET "lastEventAt" = GREATEST(COALESCE("lastEventAt", $2::timestamptz), $2::timestamptz)
            WHERE id = $1
        `, [projectId, at]);
    }
}
