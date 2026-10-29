import Project from '../models/Project';
import Funnel from '@/modules/funnels/models/Funnel';
import Issue from '@/modules/issues/models/Issue';
import Person from '@/modules/sessions/models/Person';
import ReplayChunk from '@/modules/sessions/models/ReplayChunk';
import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { objectStorage } from '@readable/storage/ObjectStorage';
import { EntityManager } from 'typeorm';

export default class ProjectRemovalService{
    async clear(projectId: string){
        await this.#dropReplayObjects(projectId);
        await Project.getRepository().manager.transaction(async (manager) => {
            await this.#dropData(manager, projectId);
            await manager.update(Project, { id: projectId }, { lastEventAt: null });
        });
    }

    async remove(projectId: string){
        await this.#dropReplayObjects(projectId);
        await Project.getRepository().manager.transaction(async (manager) => {
            await this.#dropData(manager, projectId);
            await manager.delete(Funnel, { projectId });
            await manager.delete(Project, { id: projectId });
        });
    }

    async #dropReplayObjects(projectId: string){
        const chunks = await ReplayChunk.find({ select: { storageKey: true }, where: { projectId } });
        await Promise.all(chunks.map((chunk) => objectStorage.delete(chunk.storageKey)));
    }

    async #dropData(manager: EntityManager, projectId: string){
        await manager.delete(Event, { projectId });
        await manager.delete(ReplayChunk, { projectId });
        await manager.delete(Session, { projectId });
        await manager.delete(Person, { projectId });
        await manager.delete(Issue, { projectId });
    }
}
