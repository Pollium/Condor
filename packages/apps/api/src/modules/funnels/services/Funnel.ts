import Funnel from '../models/Funnel';
import Project from '@/modules/projects/models/Project';
import { findOrThrow } from '@readable/utils/models/find-or-throw';
import { CreateFunnelInput, UpdateFunnelInput } from '@condor/contracts/funnels/http';
import { FunnelError } from '../contracts/domain/errors';

export default class FunnelService{
    list(project: Project): Promise<Funnel[]>{
        return Funnel.find({
            where: { projectId: project.id },
            order: { createdAt: 'ASC' }
        });
    }

    create(project: Project, input: CreateFunnelInput): Promise<Funnel>{
        return Funnel.create({
            projectId: project.id,
            name: input.name,
            steps: input.steps,
            windowHours: input.windowHours
        }).save();
    }

    async update(project: Project, funnelId: string, input: UpdateFunnelInput): Promise<Funnel>{
        const funnel = await this.find(project, funnelId);
        return Object.assign(funnel, input).save();
    }

    async remove(project: Project, funnelId: string){
        const funnel = await this.find(project, funnelId);
        await funnel.remove();
    }

    find(project: Project, funnelId: string): Promise<Funnel>{
        return findOrThrow(Funnel, { id: funnelId, projectId: project.id }, () => FunnelError.NotFound());
    }
}
