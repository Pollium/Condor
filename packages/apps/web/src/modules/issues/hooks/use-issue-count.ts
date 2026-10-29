import { useQuery } from '@condor/ui/hooks/api/use-query';
import { issuesApi } from '@/modules/issues/api/api';

const OPEN = { status: 'open', period: '7d' } as const;

export const useIssueCount = (projectId: string | null): number => {
    const issues = useQuery(issuesApi.list, [projectId ?? undefined, OPEN]);
    return issues.data?.length ?? 0;
};
