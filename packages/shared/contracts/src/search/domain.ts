import { Device } from '../shared/analytics';

export interface SearchPerson{
    personId: string;
    sessionId: string | null;
    name: string | null;
    email: string | null;
    userId: string | null;
    anonymousId: string;
    city: string | null;
    country: string | null;
    os: string | null;
    device: Device | null;
    sessions: number;
    lastSeenAt: string;
}

export interface SearchIssue{
    issueId: string;
    errorType: string;
    message: string;
    occurrences: number;
}

export interface SearchPage{
    path: string;
    views: number;
}

export interface SearchResults{
    people: SearchPerson[];
    issues: SearchIssue[];
    pages: SearchPage[];
}
