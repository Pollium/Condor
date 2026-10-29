import { Kpi, KpiKey } from '@condor/contracts/overview/domain';
import { Period } from '@condor/contracts/shared/period';
import { fmt } from '@/shared/utils/format';

interface KpiView{
    label: string;
    kind: 'bar' | 'line';
    format: (value: number) => string;
    axis: (value: number) => string;
    rising: 'good' | 'bad';
}

const decimal = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 });
const weekday = new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric' });

export const KPI_VIEWS: Record<KpiKey, KpiView> = {
    sessions: { label: 'Sesiones', kind: 'bar', format: fmt.n, axis: fmt.k, rising: 'good' },
    people: { label: 'Personas', kind: 'bar', format: fmt.n, axis: fmt.k, rising: 'good' },
    duration: { label: 'Duración media', kind: 'line', format: fmt.duration, axis: fmt.duration, rising: 'good' },
    bounce: { label: 'Rebote', kind: 'line', format: fmt.pct, axis: fmt.pct, rising: 'bad' },
    frustrated: { label: 'Sesiones frustradas', kind: 'line', format: fmt.pct, axis: fmt.pct, rising: 'bad' },
    errors: { label: 'Errores JS', kind: 'bar', format: fmt.n, axis: fmt.k, rising: 'bad' }
};

export const PERIOD_HINT: Record<Period, string> = {
    '24h': 'últimas 24 horas',
    '7d': 'últimos 7 días',
    '30d': 'últimos 30 días',
    '90d': 'últimos 90 días'
};

export const deltaOf = (kpi: Kpi) => kpi.previous === 0 ? null : kpi.value / kpi.previous - 1;

export const deltaTone = (kpi: Kpi) => {
    const delta = deltaOf(kpi);
    if(delta === null || Math.abs(delta) < 0.005) return 'text-label-2';
    return (delta > 0) === (KPI_VIEWS[kpi.key].rising === 'good') ? 'text-success' : 'text-danger';
};

export const deltaText = (kpi: Kpi) => {
    const delta = deltaOf(kpi);
    return delta === null ? 'Sin periodo anterior' : fmt.signed(delta);
};

export const bucketLabel = (period: Period, bucket: string) =>
    period === '24h' ? bucket.slice(11, 16) : weekday.format(new Date(bucket)).replace(',', '');

export const oneDecimal = (value: number) => decimal.format(value);
