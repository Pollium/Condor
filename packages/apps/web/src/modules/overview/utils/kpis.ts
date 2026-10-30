import { Kpi, KpiKey } from '@condor/contracts/overview/domain';
import { Period } from '@condor/contracts/shared/period';
import { copy } from '@/modules/overview/i18n';
import { intlLocale } from '@/shared/i18n/locale';
import { fmt } from '@/shared/utils/format';

interface KpiView{
    label: string;
    kind: 'bar' | 'line';
    format: (value: number) => string;
    axis: (value: number) => string;
    rising: 'good' | 'bad';
}

const decimal = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 1 });
const weekday = new Intl.DateTimeFormat(intlLocale, { weekday: 'short', day: 'numeric' });

export const KPI_VIEWS: Record<KpiKey, KpiView> = {
    sessions: { label: copy.kpis.sessions, kind: 'bar', format: fmt.n, axis: fmt.k, rising: 'good' },
    people: { label: copy.kpis.people, kind: 'bar', format: fmt.n, axis: fmt.k, rising: 'good' },
    duration: { label: copy.kpis.duration, kind: 'line', format: fmt.duration, axis: fmt.duration, rising: 'good' },
    bounce: { label: copy.kpis.bounce, kind: 'line', format: fmt.pct, axis: fmt.pct, rising: 'bad' },
    frustrated: { label: copy.kpis.frustrated, kind: 'line', format: fmt.pct, axis: fmt.pct, rising: 'bad' },
    errors: { label: copy.kpis.errors, kind: 'bar', format: fmt.n, axis: fmt.k, rising: 'bad' }
};

export const PERIOD_HINT: Record<Period, string> = copy.periods;

export const deltaOf = (kpi: Kpi) => kpi.previous === 0 ? null : kpi.value / kpi.previous - 1;

export const deltaTone = (kpi: Kpi) => {
    const delta = deltaOf(kpi);
    if(delta === null || Math.abs(delta) < 0.005) return 'text-label-2';
    return (delta > 0) === (KPI_VIEWS[kpi.key].rising === 'good') ? 'text-success' : 'text-danger';
};

export const deltaText = (kpi: Kpi) => {
    const delta = deltaOf(kpi);
    return delta === null ? copy.noPrevious : fmt.signed(delta);
};

const dayParts = (bucket: string) => {
    const parts = weekday.formatToParts(new Date(bucket));
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value ?? '';
    return `${part('weekday')} ${part('day')}`;
};

export const bucketLabel = (period: Period, bucket: string) =>
    period === '24h' ? bucket.slice(11, 16) : dayParts(bucket);

export const oneDecimal = (value: number) => decimal.format(value);
