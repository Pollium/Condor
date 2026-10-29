import { RetentionGrain } from '@condor/contracts/retention/domain';
import { fmt } from '@/shared/utils/format';

export const UNIT: Record<RetentionGrain, { short: string; one: string; column: string }> = {
    day: { short: 'D', one: 'el día', column: 'Día' },
    week: { short: 'S', one: 'la semana', column: 'Semana del' }
};

export const cohortLabel = (start: string) => fmt.day(`${start}T00:00:00`);

export const people = (count: number) => `${fmt.n(count)} ${count === 1 ? 'persona' : 'personas'}`;
