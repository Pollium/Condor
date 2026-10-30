import EventWriterService from './EventWriter';
import IssueGrouperService from './IssueGrouper';
import PersonResolverService from './PersonResolver';
import ProjectActivityService from './ProjectActivity';
import SessionTallyService from './SessionTally';
import SessionWriterService from './SessionWriter';
import Project from '@/modules/projects/models/Project';
import { eventBus } from '@readable/events/EventBus';
import { IngestBatchJob } from '@/modules/tracking/contracts/domain/queue';
import { EntityManager } from 'typeorm';

export default class BatchIngestionService{
    #people = new PersonResolverService();
    #events = new EventWriterService();
    #issues = new IssueGrouperService();
    #sessions = new SessionWriterService();
    #tally = new SessionTallyService();
    #activity = new ProjectActivityService();

    async ingest(job: IngestBatchJob){
        const project = await Project.findOneBy({ id: job.projectId });
        if(project === null) return;

        const sessionId = await Project.getRepository().manager.transaction((manager) => this.#write(manager, job, project));
        if(job.events.length > 0) await this.#activity.touch(project.id, new Date(job.receivedAt));

        eventBus.emit('tracking.batch.ingested', { projectId: project.id, sessionId });
    }

    async #write(manager: EntityManager, job: IngestBatchJob, project: Project): Promise<string | null>{
        if(job.events.length === 0){
            await this.#sessions.touch(manager, job);
            return job.sessionId;
        }

        const person = await this.#people.resolve(manager, job);
        const placed = job.sessionId === null ? { ...job, sessionId: await this.#sessions.live(manager, job, person) } : job;
        const fresh = await this.#events.insert(manager, placed, person.id);
        if(fresh.length === 0) return placed.sessionId;

        await this.#issues.group(manager, placed, fresh);
        await this.#sessions.write(manager, placed, person, this.#tally.of(fresh, project.settings.conversionEvent));
        return placed.sessionId;
    }
}
