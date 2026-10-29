import { issueRoutes } from '@condor/contracts/issues/routes';
import { UpdateIssueInput } from '@condor/contracts/issues/http';
import { IssueListQuery } from '@condor/contracts/issues/domain';
import { call } from '@condor/ui/api/call';

export const issuesApi = {
    list: (projectId: string, query: IssueListQuery) => call(issueRoutes.list, { path: { projectId }, query }),
    get: (projectId: string, issueId: string) => call(issueRoutes.get, { path: { projectId, issueId } }),
    update: (projectId: string, issueId: string, body: UpdateIssueInput) => call(issueRoutes.update, { path: { projectId, issueId }, body })
};
