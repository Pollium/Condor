import Person from '../models/Person';
import Session from '../models/Session';
import PersonMapper from './PersonMapper';
import SessionSummariesService from './SessionSummaries';
import Project from '@/modules/projects/models/Project';
import Event from '@/modules/tracking/models/Event';
import { findOrThrow } from '@readable/utils/models/find-or-throw';
import { SessionDetail, SessionEvent } from '@condor/contracts/sessions/domain';
import { SessionError } from '../contracts/domain/errors';

export default class SessionDetailService{
    #summaries = new SessionSummariesService();
    #people = new PersonMapper();

    async get(project: Project, sessionId: string): Promise<SessionDetail>{
        const session = await findOrThrow(Session, { id: sessionId, projectId: project.id }, () => SessionError.NotFound());
        const [[summary], person, events] = await Promise.all([
            this.#summaries.of([session]),
            Person.findOneByOrFail({ id: session.personId }),
            Event.find({ where: { sessionId: session.id, projectId: project.id }, order: { timestamp: 'ASC', id: 'ASC' } })
        ]);

        return {
            ...summary,
            language: session.language,
            timezone: session.timezone,
            screenWidth: session.screenWidth,
            screenHeight: session.screenHeight,
            viewportWidth: session.viewportWidth,
            connection: session.connection,
            osVersion: session.osVersion,
            browserVersion: session.browserVersion,
            referrer: session.referrer,
            utmCampaign: session.utmCampaign,
            person: this.#people.summary(person),
            timeline: events.map((event) => this.#entry(event, session.startedAt))
        };
    }

    #entry(event: Event, startedAt: Date): SessionEvent{
        return {
            id: event.id,
            type: event.type,
            name: event.name,
            path: event.path,
            rawPath: event.rawPath,
            title: event.title,
            timestamp: event.timestamp.toISOString(),
            offsetMs: event.timestamp.getTime() - startedAt.getTime(),
            selector: event.selector,
            text: event.text,
            value: event.value,
            rage: event.rage,
            dead: event.dead,
            props: event.props
        };
    }
}
