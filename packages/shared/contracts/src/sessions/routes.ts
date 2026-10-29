import { PageOf } from '../shared/http';
import { get } from '../shared/routing';
import { PersonDetail, Replay, SessionDetail, SessionSummary } from './domain';

export const sessionRoutes = {
    list: get<PageOf<SessionSummary>>('/projects/:projectId/sessions'),
    live: get<SessionSummary[]>('/projects/:projectId/sessions/live'),
    get: get<SessionDetail>('/projects/:projectId/sessions/:sessionId'),
    replay: get<Replay>('/projects/:projectId/sessions/:sessionId/replay'),
    person: get<PersonDetail>('/projects/:projectId/people/:personId')
};
