import Project from '@/modules/projects/models/Project';
import { eventBus } from '@readable/events/EventBus';
import { IngestProject } from '@/modules/projects/contracts/domain/project';
import { IngestError } from '../contracts/domain/errors';

const HIT_TTL_MS = 60_000;
const MISS_TTL_MS = 10_000;
const MAX_ENTRIES = 10_000;

interface Entry{
    project: Promise<IngestProject | null>;
    expiresAt: number;
}

export default class ProjectDirectory{
    #entries = new Map<string, Entry>();

    constructor(){
        eventBus.on('project.changed', ({ publicKeys }) => this.forget(publicKeys));
    }

    async resolve(key: string): Promise<IngestProject>{
        const project = await this.#lookup(key);
        if(project === null) throw IngestError.UnknownKey();
        return project;
    }

    forget(keys: string[]){
        for(const key of keys) this.#entries.delete(key);
    }

    #lookup(key: string): Promise<IngestProject | null>{
        const cached = this.#entries.get(key);
        if(cached !== undefined && cached.expiresAt > Date.now()) return cached.project;

        const entry: Entry = { project: this.#fetch(key), expiresAt: Number.POSITIVE_INFINITY };
        this.#entries.delete(key);
        if(this.#entries.size >= MAX_ENTRIES) this.#entries.delete(this.#entries.keys().next().value!);
        this.#entries.set(key, entry);

        entry.project.then(
            (project) => {
                entry.expiresAt = Date.now() + (project === null ? MISS_TTL_MS : HIT_TTL_MS);
            },
            () => {
                if(this.#entries.get(key) === entry) this.#entries.delete(key);
            }
        );

        return entry.project;
    }

    async #fetch(publicKey: string): Promise<IngestProject | null>{
        const project = await Project.findOneBy({ publicKey });
        if(project === null) return null;

        return {
            projectId: project.id,
            publicKey: project.publicKey,
            host: project.host,
            settings: project.settings
        };
    }
}

export const projectDirectory = new ProjectDirectory();
