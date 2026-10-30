import Person from '../models/Person';
import Session from '../models/Session';
import SessionSummariesService from './SessionSummaries';
import Project from '@/modules/projects/models/Project';
import Paginated from '@readable/controllers/responses/Paginated';
import { Page } from '@readable/contracts/params';
import { SessionSignal, SessionSort, SessionSummary } from '@condor/contracts/sessions/domain';
import { config } from '@/shared/config';
import { containsPattern } from '@/shared/sql/like-pattern';
import { resolveWindow } from '@/shared/time/period-window';
import { SessionFilter } from '../contracts/domain/filters';
import { Brackets, MoreThanOrEqual, SelectQueryBuilder } from 'typeorm';

const LIVE_LIMIT = 100;

const SIGNAL_COLUMNS: Record<SessionSignal, string> = {
    rage: 'session.rageClicks',
    dead: 'session.deadClicks',
    error: 'session.errors',
    uturn: 'session.uturns'
};

const SORT_EXPRESSIONS: Record<SessionSort, string> = {
    recent: 'session.startedAt',
    longest: 'session.duration',
    events: 'session.events',
    frustrated: '(session.rageClicks + session.deadClicks + session.errors + session.uturns)'
};

export default class SessionListService{
    #summaries = new SessionSummariesService();

    async list(project: Project, filter: SessionFilter, page: Page): Promise<Paginated<SessionSummary>>{
        const query = Session.createQueryBuilder('session')
            .where('session.projectId = :projectId', { projectId: project.id });

        await this.#narrow(query, project, filter);
        const [sessions, total] = await query
            .orderBy(SORT_EXPRESSIONS[filter.sort], 'DESC')
            .addOrderBy('session.startedAt', 'DESC')
            .addOrderBy('session.id', 'DESC')
            .offset(page.offset)
            .limit(page.limit)
            .getManyAndCount();

        return new Paginated(await this.#summaries.of(sessions), page, total);
    }

    async live(project: Project): Promise<SessionSummary[]>{
        const sessions = await Session.find({
            where: { projectId: project.id, endedAt: MoreThanOrEqual(new Date(Date.now() - config.liveWindowMs)) },
            order: { startedAt: 'DESC', id: 'DESC' },
            take: LIVE_LIMIT
        });

        return this.#summaries.of(sessions);
    }

    async #narrow(query: SelectQueryBuilder<Session>, project: Project, filter: SessionFilter){
        if(filter.period !== null){
            const window = await resolveWindow(query.connection.manager, filter.period, project.settings.timezone);
            query.andWhere('session.startedAt >= :from', { from: window.from });
        }
        if(filter.search !== null){
            query.andWhere(this.#matching(query, filter.search));
        }
        if(filter.signal !== null){
            query.andWhere(`${SIGNAL_COLUMNS[filter.signal]} > 0`);
        }
        if(filter.identified !== null){
            query.andWhere(filter.identified ? 'session.userId IS NOT NULL' : 'session.userId IS NULL');
        }
        if(filter.segment !== null){
            const members = query.subQuery()
                .select('member.id')
                .from(Person, 'member')
                .where('member.projectId = :projectId')
                .andWhere('member.traits ->> :traitKey = :traitValue')
                .getQuery();
            query.andWhere(`session.personId IN ${members}`, { traitKey: filter.segment.key, traitValue: filter.segment.value });
        }

        const equalities = {
            device: filter.device,
            country: filter.country,
            converted: filter.converted,
            hasReplay: filter.replay,
            personId: filter.personId
        };
        for(const [column, value] of Object.entries(equalities)){
            if(value !== null){
                query.andWhere(`session.${column} = :${column}`, { [column]: value });
            }
        }
    }

    #matching(query: SelectQueryBuilder<Session>, search: string): Brackets{
        const people = query.subQuery()
            .select('person.id')
            .from(Person, 'person')
            .where('person.projectId = :projectId')
            .andWhere('(person.name ILIKE :pattern OR person.email ILIKE :pattern)')
            .getQuery();

        query.setParameter('pattern', containsPattern(search));

        return new Brackets((where) => {
            where.where('session.userId ILIKE :pattern')
                .orWhere('session.anonymousId ILIKE :pattern')
                .orWhere('session.city ILIKE :pattern')
                .orWhere('session.entryPath ILIKE :pattern')
                .orWhere(`session.personId IN ${people}`);
        });
    }
}
