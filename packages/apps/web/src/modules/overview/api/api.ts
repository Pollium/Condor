import { overviewRoutes } from '@condor/contracts/overview/routes';
import { Dimension } from '@condor/contracts/overview/domain';
import { Period } from '@condor/contracts/shared/period';
import { call } from '@condor/ui/api/call';

const scoped = (projectId: string, period: Period) => ({ path: { projectId }, query: { period } });

export const overviewApi = {
    summary: (projectId: string, period: Period) => call(overviewRoutes.summary, scoped(projectId, period)),
    breakdown: (projectId: string, period: Period, dimension: Dimension, limit: number) =>
        call(overviewRoutes.breakdown, { path: { projectId }, query: { period, dimension, limit } }),
    engagement: (projectId: string, period: Period) => call(overviewRoutes.engagement, scoped(projectId, period)),
    hours: (projectId: string, period: Period) => call(overviewRoutes.hours, scoped(projectId, period)),
    vitals: (projectId: string, period: Period) => call(overviewRoutes.vitals, scoped(projectId, period))
};
