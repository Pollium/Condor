import { journeyRoutes } from '@condor/contracts/journeys/routes';
import { JourneyQuery } from '@condor/contracts/journeys/domain';
import { overviewRoutes } from '@condor/contracts/overview/routes';
import { Period } from '@condor/contracts/shared/period';
import { call } from '@condor/ui/api/call';

export const journeysApi = {
    journey: (projectId: string, query: JourneyQuery) => call(journeyRoutes.journey, { path: { projectId }, query }),
    pages: (projectId: string, period: Period) => call(overviewRoutes.breakdown, { path: { projectId }, query: { dimension: 'page', period, limit: 100 } })
};
