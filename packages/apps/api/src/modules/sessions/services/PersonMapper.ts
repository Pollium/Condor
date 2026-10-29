import Person from '../models/Person';
import { PersonSummary } from '@condor/contracts/sessions/domain';

export default class PersonMapper{
    summary(person: Person): PersonSummary{
        return {
            id: person.id,
            anonymousId: person.anonymousId,
            userId: person.userId,
            name: person.name,
            email: person.email,
            traits: person.traits,
            firstSeenAt: person.firstSeenAt.toISOString(),
            lastSeenAt: person.lastSeenAt.toISOString(),
            sessions: person.sessions
        };
    }
}
