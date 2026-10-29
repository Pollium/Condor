import Person from '../models/Person';
import Session from '../models/Session';
import PersonMapper from './PersonMapper';
import SessionSummariesService from './SessionSummaries';
import Project from '@/modules/projects/models/Project';
import { findOrThrow } from '@readable/utils/models/find-or-throw';
import { PersonDetail } from '@condor/contracts/sessions/domain';
import { SessionError } from '../contracts/domain/errors';

const RECENT_SESSIONS = 20;

export default class PersonDetailService{
    #summaries = new SessionSummariesService();
    #people = new PersonMapper();

    async get(project: Project, personId: string): Promise<PersonDetail>{
        const person = await findOrThrow(Person, { id: personId, projectId: project.id }, () => SessionError.PersonNotFound());
        const sessions = await Session.find({
            where: { personId: person.id, projectId: project.id },
            order: { startedAt: 'DESC', id: 'DESC' },
            take: RECENT_SESSIONS
        });

        return {
            ...this.#people.summary(person),
            recent: await this.#summaries.of(sessions)
        };
    }
}
