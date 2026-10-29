import { retentionRoutes } from '@condor/contracts/retention/routes';
import { RetentionQuery } from '@condor/contracts/retention/domain';
import { overviewRoutes } from '@condor/contracts/overview/routes';
import { call } from '@condor/ui/api/call';

export const retentionApi = {
    retention: (projectId: string, query: RetentionQuery) => call(retentionRoutes.retention, { path: { projectId }, query }),
    events: (projectId: string) => call(overviewRoutes.breakdown, { path: { projectId }, query: { dimension: 'event', period: '90d', limit: 100 } })
};
