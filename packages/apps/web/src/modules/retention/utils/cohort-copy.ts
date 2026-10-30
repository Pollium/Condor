import { RetentionGrain } from '@condor/contracts/retention/domain';
import { copy } from '@/modules/retention/i18n';
import { fmt } from '@/shared/utils/format';

export const UNIT: Record<RetentionGrain, { short: string; one: string; column: string }> = copy.units;

export const cohortLabel = (start: string) => fmt.day(`${start}T00:00:00`);

export const people = (count: number) => copy.people(count);
