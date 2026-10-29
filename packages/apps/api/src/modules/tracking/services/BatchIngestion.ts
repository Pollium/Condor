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

        await Project.getRepository().manager.transaction((manager) => this.#write(manager, job, project));
        if(job.events.length > 0) await this.#activity.touch(project.id, new Date(job.receivedAt));

        eventBus.emit('tracking.batch.ingested', { projectId: project.id, sessionId: job.sessionId });
    }

    async #write(manager: EntityManager, job: IngestBatchJob, project: Project){
        if(job.events.length === 0){
            await this.#sessions.touch(manager, job);
            return;
        }

        const person = await this.#people.resolve(manager, job);
        const fresh = await this.#events.insert(manager, job, person.id);
        if(fresh.length === 0) return;

        await this.#issues.group(manager, job, fresh);
        await this.#sessions.write(manager, job, person, this.#tally.of(fresh, project.settings.conversionEvent));
    }
}
