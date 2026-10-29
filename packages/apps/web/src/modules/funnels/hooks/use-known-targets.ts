import { FunnelStepKind } from '@condor/contracts/funnels/domain';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { funnelsApi } from '@/modules/funnels/api/api';

export const useKnownTargets = (projectId: string | undefined): Record<FunnelStepKind, string[]> => {
    const pages = useQuery(funnelsApi.known, [projectId, 'page', '90d']);
    const events = useQuery(funnelsApi.known, [projectId, 'event', '90d']);

    return {
        page: pages.data?.slices.map((slice) => slice.id) ?? [],
        event: events.data?.slices.map((slice) => slice.id) ?? []
    };
};
