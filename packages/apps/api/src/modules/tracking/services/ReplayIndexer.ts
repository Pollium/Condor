import ReplayTotalsService from './ReplayTotals';
import Project from '@/modules/projects/models/Project';
import ReplayChunk from '@/modules/sessions/models/ReplayChunk';
import { IngestReplayJob } from '@/modules/tracking/contracts/domain/queue';

export default class ReplayIndexerService{
    #totals = new ReplayTotalsService();

    async index(job: IngestReplayJob){
        if(!await Project.existsBy({ id: job.projectId })) return;

        await ReplayChunk.getRepository().manager.transaction(async (manager) => {
            await this.#totals.lock(manager, job.sessionId);
            await manager.createQueryBuilder()
                .insert()
                .into(ReplayChunk)
                .values({
                    projectId: job.projectId,
                    sessionId: job.sessionId,
                    seq: job.seq,
                    storageKey: job.storageKey,
                    size: job.size,
                    eventCount: job.eventCount,
                    firstAt: new Date(job.firstTimestamp),
                    lastAt: new Date(job.lastTimestamp),
                    hasFullSnapshot: job.hasFullSnapshot
                })
                .orIgnore()
                .updateEntity(false)
                .execute();
            await this.#totals.refresh(manager, job.projectId, job.sessionId);
        });
    }
}
