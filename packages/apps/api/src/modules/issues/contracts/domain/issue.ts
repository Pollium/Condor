import Issue from '../../models/Issue';
import { IssueDetail, Issue as IssueView, IssueStatus } from '@condor/contracts/issues/domain';
import { Period } from '@condor/contracts/shared/period';

export const ISSUE_STATUSES: readonly IssueStatus[] = ['open', 'resolved', 'ignored'];

export interface IssueListFilter{
    period: Period;
    status: IssueStatus | null;
    search: string | null;
}

export type IssueActivity = Pick<IssueView, 'sessions' | 'people' | 'trend'>;

export type IssueRecord = Pick<Issue,
    'id' | 'createdAt' | 'updatedAt' | 'projectId' | 'fingerprint' | 'errorType' | 'message' | 'source' | 'status'
    | 'occurrences' | 'firstSeenAt' | 'lastSeenAt' | 'firstRelease' | 'lastRelease'>;

export type IssueSummary = IssueRecord & IssueActivity & Pick<IssueView, 'state'>;

export type IssueDetailView = IssueSummary & Pick<Issue, 'stack'> & Pick<IssueDetail, 'hourly' | 'recentSessions'>;
