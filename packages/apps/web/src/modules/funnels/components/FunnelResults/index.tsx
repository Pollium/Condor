import { Button, InlineLoading } from '@carbon/react';
import { Filter, WarningAlt } from '@carbon/icons-react';
import { FunnelResult } from '@condor/contracts/funnels/domain';
import { Query } from '@condor/ui/contracts/api';
import FunnelBreakdown from '@/modules/funnels/components/FunnelBreakdown';
import FunnelChart from '@/modules/funnels/components/FunnelChart';
import FunnelStats from '@/modules/funnels/components/FunnelStats';
import EmptyState from '@/shared/components/EmptyState';
import { Section, Stack } from '@/shared/components/Page';
import { errorCopy } from '@/shared/utils/error-copy';

const copy = errorCopy({ 'Funnel::NotFound': 'Este embudo ya no existe.' });

const FunnelResults = ({ query }: { query: Query<FunnelResult> }) => {
    if(query.error && !query.data){
        return (
            <EmptyState icon={WarningAlt} title='No pudimos calcular el embudo' description={copy(query.error) ?? undefined}>
                <Button kind='tertiary' size='sm' onClick={query.reload}>Reintentar</Button>
            </EmptyState>
        );
    }
    if(!query.data) return <InlineLoading description='Calculando el embudo…' />;

    const result = query.data;
    if(!result.steps[0]?.people){
        return (
            <EmptyState
                icon={Filter}
                title='Nadie empieza este embudo en el periodo'
                description='Prueba con un periodo más largo, o revisa que el primer paso coincida con una página o un evento que tu app envía.'
            />
        );
    }

    return (
        <Stack>
            <FunnelStats result={result} />
            <Section title='Personas en cada paso'>
                <FunnelChart steps={result.steps} />
            </Section>
            <FunnelBreakdown result={result} />
        </Stack>
    );
};

export default FunnelResults;
