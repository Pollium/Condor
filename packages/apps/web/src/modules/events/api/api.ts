import { eventRoutes } from '@condor/contracts/events/routes';
import { PeriodQuery } from '@condor/contracts/shared/period';
import { SegmentQuery } from '@condor/contracts/shared/segment';
import { call } from '@condor/ui/api/call';

type ExplorerQuery = PeriodQuery & SegmentQuery;

export const eventsApi = {
    list: (projectId: string, query: ExplorerQuery) => call(eventRoutes.list, { path: { projectId }, query }),
    detail: (projectId: string, name: string, query: ExplorerQuery) => call(eventRoutes.detail, { path: { projectId, name }, query }),
    property: (projectId: string, name: string, key: string, query: ExplorerQuery) =>
        call(eventRoutes.property, { path: { projectId, name, key }, query }),
    traits: (projectId: string) => call(eventRoutes.traits, { path: { projectId } })
};
