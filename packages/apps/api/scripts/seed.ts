import 'reflect-metadata';
import 'dotenv/config';

import DemoHistory from './demo/DemoHistory';
import Issue from '@/modules/issues/models/Issue';
import Project from '@/modules/projects/models/Project';
import ProjectService from '@/modules/projects/services/Project';
import ProjectRemovalService from '@/modules/projects/services/ProjectRemoval';
import Person from '@/modules/sessions/models/Person';
import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import BatchIngestionService from '@/modules/tracking/services/BatchIngestion';
import { eventBus } from '@readable/events/EventBus';
import { createDataSource } from '@readable/http/data-source';
import { discoverFrom } from '@readable/http/discover';
import { IngestBatchJob } from '@/modules/tracking/contracts/domain/queue';
import { config } from '@/shared/config';
import { DEMO_HOST, HISTORY_DAYS, MILESTONES } from './demo/store';
import { DemoDay } from './demo/types';
import { IsNull } from 'typeorm';

const CONCURRENCY = 8;
const DEMO_TIMEZONE = 'America/Santiago';

const projects = new ProjectService();
const ingestion = new BatchIngestionService();

const demoProject = async (reset: boolean): Promise<Project> => {
    const existing = await Project.findOneBy({ host: DEMO_HOST });
    if(existing !== null){
        if(reset) await new ProjectRemovalService().clear(existing.id);
        return existing;
    }

    const created = await projects.create({ name: 'Tienda Andes', host: DEMO_HOST, platform: 'web', timezone: DEMO_TIMEZONE });
    return projects.updateSettings(created, { conversionEvent: 'purchase_completed', routeGroups: ['/productos/:slug'] });
};

const applyMilestones = async (project: Project, day: DemoDay) => {
    for(const milestone of MILESTONES.filter((entry) => entry.day === day.day)){
        await Issue.update(
            { projectId: project.id, message: milestone.message, status: 'open', resolvedAt: IsNull() },
            milestone.status === 'resolved' ? { status: 'resolved', resolvedAt: day.startsAt } : { status: 'ignored' }
        );
    }
};

const ingestAll = async (jobs: IngestBatchJob[]) => {
    const queue = [...jobs];
    const worker = async () => {
        for(let job = queue.shift(); job !== undefined; job = queue.shift()){
            await ingestion.ingest(job);
        }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
};

const seed = async () => {
    const discovered = await discoverFrom(import.meta.url, ['src/modules']);
    const dataSource = createDataSource(config.database, discovered.entities);
    await dataSource.initialize();

    const project = await demoProject(process.argv.includes('--reset'));
    for(const day of new DemoHistory(project.id, Date.now()).days()){
        await applyMilestones(project, day);
        await ingestAll(day.jobs);
        process.stdout.write(`\rday ${day.day + 1}/${HISTORY_DAYS} · ${day.jobs.length} sessions   `);
    }

    const where = { projectId: project.id };
    const [people, sessions, events] = await Promise.all([Person.countBy(where), Session.countBy(where), Event.countBy(where)]);
    const ready = await Project.findOneByOrFail({ id: project.id });
    process.stdout.write(`\n\nTienda Andes (${DEMO_HOST})\nproject id  ${ready.id}\npublic key  ${ready.publicKey}\n${people} people · ${sessions} sessions · ${events} events\n`);

    await eventBus.close();
    await dataSource.destroy();
};

await seed();
