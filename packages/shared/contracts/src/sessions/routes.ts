import { PageOf } from '@pollium/readable-contracts/http';
import { get } from '@pollium/readable-contracts/routing';
import { PersonDetail, Replay, SessionDetail, SessionSummary } from './domain';

export const sessionRoutes = {
    list: get<PageOf<SessionSummary>>('/projects/:projectId/sessions'),
    live: get<SessionSummary[]>('/projects/:projectId/sessions/live'),
    get: get<SessionDetail>('/projects/:projectId/sessions/:sessionId'),
    replay: get<Replay>('/projects/:projectId/sessions/:sessionId/replay'),
    person: get<PersonDetail>('/projects/:projectId/people/:personId')
};
