import { Dimension } from '@condor/contracts/overview/domain';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { overviewApi } from '@/modules/overview/api/api';
import { useScope } from '@/modules/overview/hooks/use-scope';

export const useBreakdown = (dimension: Dimension | undefined, limit = 6) => {
    const { projectId, period } = useScope();
    return useQuery(overviewApi.breakdown, [projectId, period, dimension, limit]);
};
