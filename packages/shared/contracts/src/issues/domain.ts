import { BaseEntity } from '../shared/base';
import { Period } from '../shared/period';

export type IssueStatus = 'open' | 'resolved' | 'ignored';

export type IssueState = 'new' | 'open' | 'regressed' | 'resolved' | 'ignored';

export interface Issue extends BaseEntity{
    projectId: string;
    fingerprint: string;
    errorType: string;
    message: string;
    source: string | null;
    status: IssueStatus;
    state: IssueState;
    occurrences: number;
    sessions: number;
    people: number;
    firstSeenAt: string;
    lastSeenAt: string;
    firstRelease: string | null;
    lastRelease: string | null;
    trend: number[];
}

export interface IssueDetail extends Issue{
    stack: string | null;
    hourly: number[];
    recentSessions: string[];
}

export interface IssueListQuery{
    period?: Period;
    status?: IssueStatus;
    search?: string;
}
