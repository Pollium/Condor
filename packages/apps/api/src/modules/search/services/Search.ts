import Issue from '@/modules/issues/models/Issue';
import Project from '@/modules/projects/models/Project';
import Person from '@/modules/sessions/models/Person';
import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { SearchIssue, SearchPage, SearchPerson, SearchResults } from '@condor/contracts/search/domain';
import { containsPattern } from '@/shared/sql/like-pattern';
import { Brackets, In } from 'typeorm';

const PEOPLE_LIMIT = 5;
const ISSUES_LIMIT = 5;
const PAGES_LIMIT = 5;

const EMPTY: SearchResults = {
    people: [],
    issues: [],
    pages: []
};

export default class SearchService{
    async search(project: Project, query: string | undefined): Promise<SearchResults>{
        const term = query?.trim() ?? '';
        if(term === '') return EMPTY;

        const pattern = containsPattern(term);
        const [people, issues, pages] = await Promise.all([
            this.#people(project.id, pattern),
            this.#issues(project.id, pattern),
            this.#pages(project.id, pattern)
        ]);

        return {
            people,
            issues,
            pages
        };
    }

    async #people(projectId: string, pattern: string): Promise<SearchPerson[]>{
        const people = await this.#matchingPeople(projectId, pattern);
        const sessions = await this.#latestSessions(people);

        return people.map((person) => this.#person(person, sessions.get(person.id)));
    }

    #matchingPeople(projectId: string, pattern: string): Promise<Person[]>{
        return Person.createQueryBuilder('person')
            .where('person.projectId = :projectId', { projectId })
            .andWhere(new Brackets((where) => {
                where.where('person.name ILIKE :pattern', { pattern })
                    .orWhere('person.email ILIKE :pattern')
                    .orWhere('person.userId ILIKE :pattern')
                    .orWhere('person.anonymousId ILIKE :pattern');
            }))
            .orderBy('person.lastSeenAt', 'DESC')
            .limit(PEOPLE_LIMIT)
            .getMany();
    }

    async #latestSessions(people: Person[]): Promise<Map<string, Session>>{
        if(people.length === 0) return new Map();

        const latest = await Session.createQueryBuilder('session')
            .distinctOn(['session.personId'])
            .where({ personId: In(people.map((person) => person.id)) })
            .orderBy('session.personId')
            .addOrderBy('session.startedAt', 'DESC')
            .getMany();

        return new Map(latest.map((session) => [session.personId, session]));
    }

    #person(person: Person, session: Session | undefined): SearchPerson{
        return {
            personId: person.id,
            sessionId: session?.id ?? null,
            name: person.name,
            email: person.email,
            userId: person.userId,
            anonymousId: person.anonymousId,
            city: session?.city ?? null,
            country: session?.country ?? null,
            os: session?.os ?? null,
            device: session?.device ?? null,
            sessions: person.sessions,
            lastSeenAt: person.lastSeenAt.toISOString()
        };
    }

    async #issues(projectId: string, pattern: string): Promise<SearchIssue[]>{
        const issues = await Issue.createQueryBuilder('issue')
            .where('issue.projectId = :projectId', { projectId })
            .andWhere('(issue.message ILIKE :pattern OR issue.errorType ILIKE :pattern)', { pattern })
            .orderBy('issue.lastSeenAt', 'DESC')
            .limit(ISSUES_LIMIT)
            .getMany();

        return issues.map((issue) => {
            return {
                issueId: issue.id,
                errorType: issue.errorType,
                message: issue.message,
                occurrences: issue.occurrences
            };
        });
    }

    #pages(projectId: string, pattern: string): Promise<SearchPage[]>{
        return Event.createQueryBuilder('event')
            .select('event.path', 'path')
            .addSelect('COUNT(*)::int', 'views')
            .where('event.projectId = :projectId', { projectId })
            .andWhere('event.type = :type', { type: 'pageview' })
            .andWhere('event.path ILIKE :pattern', { pattern })
            .groupBy('event.path')
            .orderBy('views', 'DESC')
            .addOrderBy('event.path', 'ASC')
            .limit(PAGES_LIMIT)
            .getRawMany<SearchPage>();
    }
}
