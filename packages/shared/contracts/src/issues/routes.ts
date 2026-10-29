import { get, patch } from '../shared/routing';
import { Issue, IssueDetail } from './domain';
import { UpdateIssueInput } from './http';

export const issueRoutes = {
    list: get<Issue[]>('/projects/:projectId/issues'),
    get: get<IssueDetail>('/projects/:projectId/issues/:issueId'),
    update: patch<UpdateIssueInput, Issue>('/projects/:projectId/issues/:issueId')
};
