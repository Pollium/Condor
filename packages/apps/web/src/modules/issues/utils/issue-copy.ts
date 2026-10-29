import { Issue, IssueState, IssueStatus } from '@condor/contracts/issues/domain';
import type { Choice } from '@/shared/components/Segmented';
import { fmt } from '@/shared/utils/format';

export type IssueFilter = 'all' | IssueStatus;

export const FILTERS: Choice<IssueFilter>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'open', label: 'Sin resolver' },
    { value: 'resolved', label: 'Resueltos' },
    { value: 'ignored', label: 'Ignorados' }
];

export const STATES: Record<IssueState, string> = {
    new: 'Nuevo',
    open: 'Abierto',
    regressed: 'Reapareció',
    resolved: 'Resuelto',
    ignored: 'Ignorado'
};

export const issueTitle = (issue: Issue) => `${issue.errorType}: ${issue.message}`;

export const sessionCount = (count: number) => `${fmt.n(count)} ${count === 1 ? 'sesión' : 'sesiones'}`;

export const shortSource = (source: string | null) => source?.replace(/^[a-z]+:\/\/[^/]+/i, '') ?? null;

const hourFormat = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', hourCycle: 'h23' });

export const hourlyBars = (hourly: number[], now = Date.now()) => hourly.map((value, index) => ({
    label: hourFormat.format(new Date(now - (hourly.length - 1 - index) * 3_600_000)),
    value
}));
