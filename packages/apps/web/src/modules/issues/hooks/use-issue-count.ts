import { issueRoutes } from '@condor/contracts/issues/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';

const OPEN = { status: 'open', period: '7d' } as const;

export const useIssueCount = (projectId: string | null): number => {
    const issues = useQuery(issueRoutes.list, projectId !== null && { path: { projectId }, query: OPEN });
    return issues.data?.length ?? 0;
};
