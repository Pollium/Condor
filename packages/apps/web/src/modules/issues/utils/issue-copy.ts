import { Issue, IssueState, IssueStatus } from '@condor/contracts/issues/domain';
import { copy } from '@/modules/issues/i18n';
import type { Choice } from '@/shared/components/Segmented';
import { intlLocale } from '@/shared/i18n/locale';

export type IssueFilter = 'all' | IssueStatus;

export const FILTERS: Choice<IssueFilter>[] = [
    { value: 'all', label: copy.filters.all },
    { value: 'open', label: copy.filters.open },
    { value: 'resolved', label: copy.filters.resolved },
    { value: 'ignored', label: copy.filters.ignored }
];

export const STATES: Record<IssueState, string> = copy.states;

export const issueTitle = (issue: Issue) => `${issue.errorType}: ${issue.message}`;

export const sessionCount = (count: number) => copy.sessions(count);

export const shortSource = (source: string | null) => source?.replace(/^[a-z]+:\/\/[^/]+/i, '') ?? null;

const hourFormat = new Intl.DateTimeFormat(intlLocale, { hour: '2-digit', hourCycle: 'h23' });

export const hourlyBars = (hourly: number[], now = Date.now()) => hourly.map((value, index) => ({
    label: hourFormat.format(new Date(now - (hourly.length - 1 - index) * 3_600_000)),
    value
}));
