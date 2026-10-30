import { Button, InlineLoading } from '@carbon/react';
import { Filter, WarningAlt } from '@carbon/icons-react';
import { FunnelResult } from '@condor/contracts/funnels/domain';
import { Query } from '@condor/ui/contracts/api';
import FunnelBreakdown from '@/modules/funnels/components/FunnelBreakdown';
import FunnelChart from '@/modules/funnels/components/FunnelChart';
import FunnelStats from '@/modules/funnels/components/FunnelStats';
import { copy } from '@/modules/funnels/i18n';
import EmptyState from '@/shared/components/EmptyState';
import { Section, Stack } from '@/shared/components/Page';
import { errorCopy } from '@/shared/utils/error-copy';

const failure = errorCopy({ 'Funnel::NotFound': copy.errors.notFound });

const FunnelResults = ({ query }: { query: Query<FunnelResult> }) => {
    if(query.error && !query.data){
        return (
            <EmptyState icon={WarningAlt} title={copy.results.failed} description={failure(query.error) ?? undefined}>
                <Button kind='tertiary' size='sm' onClick={query.reload}>{copy.results.retry}</Button>
            </EmptyState>
        );
    }
    if(!query.data) return <InlineLoading description={copy.results.loading} />;

    const result = query.data;
    if(!result.steps[0]?.people){
        return (
            <EmptyState
                icon={Filter}
                title={copy.results.emptyTitle}
                description={copy.results.emptyHint}
            />
        );
    }

    return (
        <Stack>
            <FunnelStats result={result} />
            <Section title={copy.results.chart}>
                <FunnelChart steps={result.steps} />
            </Section>
            <FunnelBreakdown result={result} />
        </Stack>
    );
};

export default FunnelResults;
