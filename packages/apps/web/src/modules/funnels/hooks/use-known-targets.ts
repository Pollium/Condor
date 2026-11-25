import { FunnelStepKind } from '@condor/contracts/funnels/domain';
import { overviewRoutes } from '@condor/contracts/overview/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';

export const useKnownTargets = (projectId: string | undefined): Record<FunnelStepKind, string[]> => {
    const pages = useQuery(overviewRoutes.breakdown, { path: { projectId }, query: { dimension: 'page', period: '90d', limit: 50 } });
    const events = useQuery(overviewRoutes.breakdown, { path: { projectId }, query: { dimension: 'event', period: '90d', limit: 50 } });

    return {
        page: pages.data?.slices.map((slice) => slice.id) ?? [],
        event: events.data?.slices.map((slice) => slice.id) ?? []
    };
};
