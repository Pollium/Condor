import { SkeletonText } from '@carbon/react';
import { VitalName, VitalRating } from '@condor/contracts/shared/analytics';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { overviewApi } from '@/modules/overview/api/api';
import Loaded from '@/modules/overview/components/Loaded';
import { useScope } from '@/modules/overview/hooks/use-scope';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import { fmt } from '@/shared/utils/format';

const seconds = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const shift = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const VITALS: Record<VitalName, { detail: string; format: (value: number) => string }> = {
    LCP: { detail: 'Mayor contenido visible', format: (value) => `${seconds.format(value / 1000)} s` },
    INP: { detail: 'Respuesta a la interacción', format: (value) => `${fmt.n(Math.round(value))} ms` },
    CLS: { detail: 'Estabilidad visual', format: (value) => shift.format(value) },
    FCP: { detail: 'Primer contenido', format: (value) => `${seconds.format(value / 1000)} s` },
    TTFB: { detail: 'Respuesta del servidor', format: (value) => `${fmt.n(Math.round(value))} ms` }
};

const RATING: Record<VitalRating, { label: string; dot: string }> = {
    good: { label: 'Bueno', dot: 'bg-success' },
    'needs-improvement': { label: 'Mejorable', dot: 'bg-warning' },
    poor: { label: 'Malo', dot: 'bg-danger' }
};

const Vitals = () => {
    const { projectId, period } = useScope();
    const query = useQuery(overviewApi.vitals, [projectId, period]);

    return (
        <Loaded query={query} skeleton={<SkeletonText paragraph lineCount={3} />}>
            {(vitals) => vitals.length === 0 ? (
                <p className='text-[0.8125rem] text-label-2'>Aún no hay mediciones en este periodo.</p>
            ) : (
                <StatRow columns={5}>
                    {vitals.map((vital) => (
                        <StatTile
                            key={vital.name}
                            label={`${vital.name} · ${VITALS[vital.name].detail}`}
                            value={vital.samples ? VITALS[vital.name].format(vital.p75) : '—'}
                        >
                            <span className='mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-label-2'>
                                <span className={`size-1.5 shrink-0 rounded-full ${RATING[vital.rating].dot}`} />
                                {RATING[vital.rating].label} · {fmt.pct(vital.good)}
                            </span>
                        </StatTile>
                    ))}
                </StatRow>
            )}
        </Loaded>
    );
};

export default Vitals;
