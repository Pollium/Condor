import { heatmapRoutes } from '@condor/contracts/heatmaps/routes';
import { HeatmapQuery } from '@condor/contracts/heatmaps/domain';
import { sessionRoutes } from '@condor/contracts/sessions/routes';
import { Period } from '@condor/contracts/shared/period';
import { call } from '@condor/ui/api/call';

export const heatmapsApi = {
    pages: (projectId: string, period: Period) => call(heatmapRoutes.pages, { path: { projectId }, query: { period } }),
    heatmap: (projectId: string, query: HeatmapQuery) => call(heatmapRoutes.heatmap, { path: { projectId }, query }),
    replay: (projectId: string, sessionId: string) => call(sessionRoutes.replay, { path: { projectId, sessionId } })
};
