import { sessionRoutes } from '@condor/contracts/sessions/routes';
import { SessionListQuery } from '@condor/contracts/sessions/domain';
import { call } from '@condor/ui/api/call';

export const sessionsApi = {
    list: (projectId: string, query: SessionListQuery) => call(sessionRoutes.list, { path: { projectId }, query }),
    get: (projectId: string, sessionId: string) => call(sessionRoutes.get, { path: { projectId, sessionId } }),
    replay: (projectId: string, sessionId: string) => call(sessionRoutes.replay, { path: { projectId, sessionId } }),
    person: (projectId: string, personId: string) => call(sessionRoutes.person, { path: { projectId, personId } })
};
