import { Button, InlineLoading } from '@carbon/react';
import { Calendar, WarningAlt } from '@carbon/icons-react';
import { RetentionGrain } from '@condor/contracts/retention/domain';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { useState } from 'react';
import SegmentMenu from '@/modules/events/components/SegmentMenu';
import { useSegmentQuery } from '@/modules/events/hooks/use-segment';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { retentionApi } from '@/modules/retention/api/api';
import CohortGrid from '@/modules/retention/components/CohortGrid';
import RetentionStats from '@/modules/retention/components/RetentionStats';
import { copy } from '@/modules/retention/i18n';
import { UNIT } from '@/modules/retention/utils/cohort-copy';
import { TrendChart } from '@/shared/components/Charts';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader, Section, Stack } from '@/shared/components/Page';
import type { Choice } from '@/shared/components/Segmented';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { copy as shared } from '@/shared/i18n';
import { errorCopy } from '@/shared/utils/error-copy';
import { fmt } from '@/shared/utils/format';

const GRAINS: Choice<RetentionGrain>[] = [
    { value: 'day', label: copy.page.grains.day },
    { value: 'week', label: copy.page.grains.week }
];

const COHORTS: Record<RetentionGrain, number> = { day: 14, week: 12 };

const ANY_VISIT = '';

const RetentionPage = () => {
    const project = useProject();
    const [grain, setGrain] = useState<RetentionGrain>('week');
    const [returnEvent, setReturnEvent] = useState(ANY_VISIT);
    const events = useQuery(retentionApi.events, [project.id]);
    const segment = useSegmentQuery(project.id);
    const retention = useQuery(retentionApi.retention, [project.id, { grain, cohorts: COHORTS[grain], returnEvent: returnEvent || undefined, ...segment }]);
    const returns: Choice<string>[] = [
        { value: ANY_VISIT, label: copy.page.anyVisit },
        ...(events.data?.slices ?? []).map((slice) => ({ value: slice.id, label: slice.label }))
    ];
    const unit = UNIT[grain];

    const body = () => {
        if(retention.error && !retention.data){
            return (
                <EmptyState icon={WarningAlt} title={copy.page.failed} description={errorCopy()(retention.error) ?? undefined}>
                    <Button kind='tertiary' size='sm' onClick={retention.reload}>{copy.page.retry}</Button>
                </EmptyState>
            );
        }
        if(!retention.data) return <InlineLoading description={copy.page.loading} />;
        if(!retention.data.cohorts.some((cohort) => cohort.size > 0)){
            return (
                <EmptyState
                    icon={Calendar}
                    title={copy.page.emptyTitle}
                    description={copy.page.emptyHint}
                />
            );
        }
        const data = retention.data;
        return (
            <Stack>
                <RetentionStats retention={data} />
                <Section title={copy.page.curve}>
                    <TrendChart
                        kind='line'
                        unit={copy.page.returning}
                        format={fmt.pct}
                        data={data.average.map((value, index) => ({ label: `${unit.short}${index}`, value }))}
                    />
                </Section>
                <Section
                    title={copy.page.cohorts[grain]}
                    aside={<p className='text-[0.8125rem] text-muted'>{copy.page.cohortsHint[grain]}</p>}
                >
                    <CohortGrid retention={data} />
                </Section>
            </Stack>
        );
    };

    return (
        <div className='w-full'>
            <PageHeader title={shared.views.retention} hint={copy.page.hint}>
                <SegmentMenu projectId={project.id} />
                <ToolbarMenu label={copy.page.returnEvent} choices={returns} value={returnEvent} onChange={setReturnEvent} />
                <ToolbarMenu label={copy.page.groupBy} choices={GRAINS} value={grain} onChange={setGrain} />
            </PageHeader>

            {body()}
        </div>
    );
};

export default RetentionPage;
