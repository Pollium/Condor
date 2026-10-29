import Project from '../models/Project';
import ProjectRemovalService from './ProjectRemoval';
import ProjectSettingsService from './ProjectSettings';
import { eventBus } from '@readable/events/EventBus';
import { CreateProjectInput, UpdateProjectInput, UpdateSettingsInput } from '@condor/contracts/projects/http';
import { randomBytes } from 'node:crypto';

const KEY_PREFIX = 'ck_';
const KEY_BYTES = 18;
const TINTS = ['#0f62fe', '#8a3ffc', '#007d79', '#d02670', '#ba4e00', '#198038', '#1192e8', '#b28600'];

export default class ProjectService{
    #settings = new ProjectSettingsService();
    #removal = new ProjectRemovalService();

    list(): Promise<Project[]>{
        return Project.find({ order: { createdAt: 'ASC' } });
    }

    async create(input: CreateProjectInput): Promise<Project>{
        const settings = this.#settings.defaults(input.timezone);
        const existing = await Project.count();

        return Project.create({
            name: input.name,
            host: input.host,
            platform: input.platform,
            tint: TINTS[existing % TINTS.length],
            publicKey: this.#newKey(),
            settings,
            lastEventAt: null
        }).save();
    }

    update(project: Project, input: UpdateProjectInput): Promise<Project>{
        Object.assign(project, input);

        return this.#saveChanged(project, [project.publicKey]);
    }

    updateSettings(project: Project, input: UpdateSettingsInput): Promise<Project>{
        project.settings = this.#settings.apply(project.settings, input);

        return this.#saveChanged(project, [project.publicKey]);
    }

    rotateKey(project: Project): Promise<Project>{
        const previous = project.publicKey;
        project.publicKey = this.#newKey();

        return this.#saveChanged(project, [previous, project.publicKey]);
    }

    async remove(project: Project){
        await this.#removal.remove(project.id);
        eventBus.emit('project.changed', { projectId: project.id, publicKeys: [project.publicKey] });
    }

    async #saveChanged(project: Project, publicKeys: string[]): Promise<Project>{
        await project.save();
        eventBus.emit('project.changed', { projectId: project.id, publicKeys });

        return project;
    }

    #newKey(): string{
        return `${KEY_PREFIX}${randomBytes(KEY_BYTES).toString('base64url')}`;
    }
}
