import Project from '@/modules/projects/models/Project';
import Person from '@/modules/sessions/models/Person';
import ReplayChunk from '@/modules/sessions/models/ReplayChunk';
import Session from '@/modules/sessions/models/Session';
import Event from '../models/Event';
import { objectStorage } from '@readable/storage/ObjectStorage';
import { tableRef } from '@readable/utils/models/table-ref';
import { In, LessThan } from 'typeorm';

const DAY_MS = 86_400_000;
const CHUNKS_PER_PASS = 500;

export default class RetentionSweeperService{
    async run(){
        for(const project of await Project.find()){
            await this.#sweep(project);
        }
    }

    async #sweep(project: Project){
        const cutoff = new Date(Date.now() - project.settings.retentionDays * DAY_MS);

        await this.#dropReplays(project.id, cutoff);
        await Event.delete({ projectId: project.id, timestamp: LessThan(cutoff) });
        await Session.delete({ projectId: project.id, endedAt: LessThan(cutoff) });
        await this.#dropPeopleWithoutSessions(project.id, cutoff);
    }

    async #dropReplays(projectId: string, cutoff: Date){
        let chunks = await this.#expiredChunks(projectId, cutoff);
        while(chunks.length > 0){
            await Promise.all(chunks.map((chunk) => objectStorage.delete(chunk.storageKey)));
            await ReplayChunk.delete({ id: In(chunks.map((chunk) => chunk.id)) });
            chunks = await this.#expiredChunks(projectId, cutoff);
        }
    }

    #expiredChunks(projectId: string, cutoff: Date): Promise<ReplayChunk[]>{
        return ReplayChunk.find({
            select: { id: true, storageKey: true },
            where: { projectId, lastAt: LessThan(cutoff) },
            take: CHUNKS_PER_PASS
        });
    }

    async #dropPeopleWithoutSessions(projectId: string, cutoff: Date){
        const manager = Person.getRepository().manager;
        const people = tableRef(manager, Person).table;
        const sessions = tableRef(manager, Session).table;

        await manager.query(`
            DELETE FROM ${people} AS person
            WHERE person."projectId" = $1
                AND person."lastSeenAt" < $2
                AND NOT EXISTS (SELECT 1 FROM ${sessions} AS session WHERE session."personId" = person.id)
        `, [projectId, cutoff]);
    }
}
