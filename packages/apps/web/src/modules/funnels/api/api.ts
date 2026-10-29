import { funnelRoutes } from '@condor/contracts/funnels/routes';
import { CreateFunnelInput, UpdateFunnelInput } from '@condor/contracts/funnels/http';
import { FunnelResultQuery } from '@condor/contracts/funnels/domain';
import { overviewRoutes } from '@condor/contracts/overview/routes';
import { Dimension } from '@condor/contracts/overview/domain';
import { Period } from '@condor/contracts/shared/period';
import { call } from '@condor/ui/api/call';

export const funnelsApi = {
    list: (projectId: string) => call(funnelRoutes.list, { path: { projectId } }),
    create: (projectId: string, body: CreateFunnelInput) => call(funnelRoutes.create, { path: { projectId }, body }),
    update: (projectId: string, funnelId: string, body: UpdateFunnelInput) => call(funnelRoutes.update, { path: { projectId, funnelId }, body }),
    remove: (projectId: string, funnelId: string) => call(funnelRoutes.remove, { path: { projectId, funnelId } }),
    results: (projectId: string, funnelId: string, query: FunnelResultQuery) => call(funnelRoutes.results, { path: { projectId, funnelId }, query }),
    known: (projectId: string, dimension: Dimension, period: Period) => call(overviewRoutes.breakdown, { path: { projectId }, query: { dimension, period, limit: 50 } })
};
