import Event from '../models/Event';
import { IngestBatchJob, IngestEvent } from '@/modules/tracking/contracts/domain/queue';
import { EntityManager, QueryDeepPartialEntity } from 'typeorm';

type EventRow = QueryDeepPartialEntity<Event>;

interface InsertedRow{
    id: string;
}

export default class EventWriterService{
    async insert(manager: EntityManager, job: IngestBatchJob, personId: string): Promise<IngestEvent[]>{
        const result = await manager.createQueryBuilder()
            .insert()
            .into(Event)
            .values(job.events.map((event) => this.#row(job, personId, event)))
            .orIgnore()
            .returning('id')
            .updateEntity(false)
            .execute();

        const inserted = new Set((result.raw as InsertedRow[]).map((row) => row.id));
        return job.events.filter((event) => inserted.delete(event.id.toLowerCase()));
    }

    #row(job: IngestBatchJob, personId: string, event: IngestEvent): EventRow{
        return {
            id: event.id,
            projectId: job.projectId,
            sessionId: job.sessionId,
            personId,
            type: event.type,
            path: event.path,
            rawPath: event.rawPath,
            title: event.title ?? null,
            timestamp: new Date(event.timestamp),
            device: job.context.device,
            release: job.context.release,
            ...this.#details(event)
        };
    }

    #details(event: IngestEvent): EventRow{
        switch(event.type){
            case 'pageview':
                return { props: event.uturn === undefined ? null : { uturn: event.uturn } };
            case 'pageleave':
                return {
                    value: event.scrollDepth,
                    documentHeight: event.documentHeight,
                    props: { durationMs: event.durationMs, activeMs: event.activeMs }
                };
            case 'click':
                return {
                    x: event.x,
                    y: event.y,
                    viewportWidth: event.viewportWidth,
                    documentHeight: event.documentHeight,
                    selector: event.selector,
                    text: event.text ?? null,
                    rage: event.rage,
                    dead: event.dead
                };
            case 'custom':
                return {
                    name: event.name,
                    props: event.props ?? null,
                    value: typeof event.props?.value === 'number' ? event.props.value : null
                };
            case 'error':
                return {
                    text: event.message,
                    props: { errorType: event.errorType, source: event.source ?? null }
                };
            case 'vital':
                return {
                    name: event.name,
                    value: event.value,
                    props: { rating: event.rating }
                };
            case 'identify':
                return {
                    name: event.userId,
                    props: event.traits ?? null
                };
        }
    }
}
