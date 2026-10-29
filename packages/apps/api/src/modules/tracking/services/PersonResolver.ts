import Person from '@/modules/sessions/models/Person';
import Session from '@/modules/sessions/models/Session';
import { tableRef } from '@readable/utils/models/table-ref';
import { IngestBatchJob } from '@/modules/tracking/contracts/domain/queue';
import { Traits } from '@condor/contracts/shared/analytics';
import { eventsOfType } from '../contracts/domain/ingest';
import { EntityManager } from 'typeorm';

export default class PersonResolverService{
    async resolve(manager: EntityManager, job: IngestBatchJob): Promise<Person>{
        const person = await this.#upsert(manager, job);
        const identifies = eventsOfType(job.events, 'identify').sort((left, right) => left.timestamp - right.timestamp);
        const traits = identifies.reduce<Traits>((merged, identify) => ({ ...merged, ...identify.traits }), person.traits);
        const userId = identifies.at(-1)?.userId ?? job.userId ?? person.userId;

        if(identifies.length === 0 && userId === person.userId) return person;

        const linked = userId !== person.userId;
        const identity = {
            userId,
            traits,
            name: typeof traits.name === 'string' ? traits.name : person.name,
            email: typeof traits.email === 'string' ? traits.email : person.email
        };
        await manager.update(Person, { id: person.id }, identity);
        Object.assign(person, identity);

        if(linked && userId !== null){
            await manager.update(Session, { personId: person.id }, { userId, personKey: userId });
        }

        return person;
    }

    async #upsert(manager: EntityManager, job: IngestBatchJob): Promise<Person>{
        const stamps = job.events.map((event) => event.timestamp);
        const people = tableRef(manager, Person).table;

        const [row] = await manager.query<Person[]>(`
            INSERT INTO ${people} AS person ("projectId", "anonymousId", "firstSeenAt", "lastSeenAt")
            VALUES ($1, $2, $3, $4)
            ON CONFLICT ("projectId", "anonymousId") DO UPDATE SET
                "firstSeenAt" = LEAST(person."firstSeenAt", EXCLUDED."firstSeenAt"),
                "lastSeenAt" = GREATEST(person."lastSeenAt", EXCLUDED."lastSeenAt"),
                "updatedAt" = now()
            RETURNING *
        `, [job.projectId, job.anonymousId, new Date(Math.min(...stamps)), new Date(Math.max(...stamps))]);

        return manager.create(Person, row);
    }
}
