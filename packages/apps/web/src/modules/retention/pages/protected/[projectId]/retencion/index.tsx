import { Button, InlineLoading } from '@carbon/react';
import { Calendar, WarningAlt } from '@carbon/icons-react';
import { RetentionGrain } from '@condor/contracts/retention/domain';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { useState } from 'react';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { retentionApi } from '@/modules/retention/api/api';
import CohortGrid from '@/modules/retention/components/CohortGrid';
import RetentionStats from '@/modules/retention/components/RetentionStats';
import { UNIT } from '@/modules/retention/utils/cohort-copy';
import { TrendChart } from '@/shared/components/Charts';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader, Section, Stack } from '@/shared/components/Page';
import type { Choice } from '@/shared/components/Segmented';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { errorCopy } from '@/shared/utils/error-copy';
import { fmt } from '@/shared/utils/format';

const GRAINS: Choice<RetentionGrain>[] = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' }
];

const COHORTS: Record<RetentionGrain, number> = { day: 14, week: 12 };

const ANY_VISIT = '';

const RetentionPage = () => {
    const project = useProject();
    const [grain, setGrain] = useState<RetentionGrain>('week');
    const [returnEvent, setReturnEvent] = useState(ANY_VISIT);
    const events = useQuery(retentionApi.events, [project.id]);
    const retention = useQuery(retentionApi.retention, [project.id, { grain, cohorts: COHORTS[grain], returnEvent: returnEvent || undefined }]);
    const returns: Choice<string>[] = [
        { value: ANY_VISIT, label: 'Cualquier visita' },
        ...(events.data?.slices ?? []).map((slice) => ({ value: slice.id, label: slice.label }))
    ];
    const unit = UNIT[grain];

    const body = () => {
        if(retention.error && !retention.data){
            return (
                <EmptyState icon={WarningAlt} title='No pudimos calcular la retención' description={errorCopy()(retention.error) ?? undefined}>
                    <Button kind='tertiary' size='sm' onClick={retention.reload}>Reintentar</Button>
                </EmptyState>
            );
        }
        if(!retention.data) return <InlineLoading description='Agrupando a las personas por cohorte…' />;
        if(!retention.data.cohorts.some((cohort) => cohort.size > 0)){
            return (
                <EmptyState
                    icon={Calendar}
                    title='Aún no hay cohortes'
                    description='Cuando lleguen personas nuevas a tu app verás aquí cuántas vuelven cada día o semana.'
                />
            );
        }
        const data = retention.data;
        return (
            <Stack>
                <RetentionStats retention={data} />
                <Section title='Curva de retención'>
                    <TrendChart
                        kind='line'
                        unit='Vuelven'
                        format={fmt.pct}
                        data={data.average.map((value, index) => ({ label: `${unit.short}${index}`, value }))}
                    />
                </Section>
                <Section
                    title={grain === 'week' ? 'Cohortes semanales' : 'Cohortes diarias'}
                    aside={<p className='text-[0.8125rem] text-muted'>{`% de cada cohorte que vuelve ${grain === 'week' ? 'esa semana' : 'ese día'}`}</p>}
                >
                    <CohortGrid retention={data} />
                </Section>
            </Stack>
        );
    };

    return (
        <div className='w-full'>
            <PageHeader title='Retención' hint='Personas que vuelven tras su primera visita'>
                <ToolbarMenu label='Cuenta como regreso' choices={returns} value={returnEvent} onChange={setReturnEvent} />
                <ToolbarMenu label='Agrupar por' choices={GRAINS} value={grain} onChange={setGrain} />
            </PageHeader>

            {body()}
        </div>
    );
};

export default RetentionPage;
