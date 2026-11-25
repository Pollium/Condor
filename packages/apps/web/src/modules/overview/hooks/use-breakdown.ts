import { Dimension } from '@condor/contracts/overview/domain';
import { overviewRoutes } from '@condor/contracts/overview/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { useScope } from '@/modules/overview/hooks/use-scope';

export const useBreakdown = (dimension: Dimension | undefined, limit = 6) => {
    const { projectId, period } = useScope();
    return useQuery(overviewRoutes.breakdown, dimension !== undefined && { path: { projectId }, query: { period, dimension, limit } });
};
