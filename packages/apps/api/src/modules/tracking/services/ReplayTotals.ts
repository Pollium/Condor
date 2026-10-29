import ReplayChunk from '@/modules/sessions/models/ReplayChunk';
import Session from '@/modules/sessions/models/Session';
import { advisoryLock } from '@readable/utils/models/advisory-lock';
import { tableRef } from '@readable/utils/models/table-ref';
import { EntityManager } from 'typeorm';

const SESSION_LOCK_NAMESPACE = 4103;

export default class ReplayTotalsService{
    lock(manager: EntityManager, sessionId: string){
        return advisoryLock(manager, SESSION_LOCK_NAMESPACE, sessionId);
    }

    async refresh(manager: EntityManager, projectId: string, sessionId: string){
        const sessions = tableRef(manager, Session).table;
        const chunks = tableRef(manager, ReplayChunk).table;

        await manager.query(`
            UPDATE ${sessions} AS session
            SET "hasReplay" = true, "replayBytes" = totals.bytes, "updatedAt" = now()
            FROM (
                SELECT SUM(size)::int AS bytes FROM ${chunks} WHERE "sessionId" = $1 AND "projectId" = $2
            ) AS totals
            WHERE session.id = $1 AND session."projectId" = $2 AND totals.bytes IS NOT NULL
        `, [sessionId, projectId]);
    }
}
