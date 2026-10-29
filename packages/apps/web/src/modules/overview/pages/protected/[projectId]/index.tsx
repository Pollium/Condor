import { SkeletonPlaceholder } from '@carbon/react';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { overviewApi } from '@/modules/overview/api/api';
import AcquisitionCard from '@/modules/overview/components/AcquisitionCard';
import AudienceCard from '@/modules/overview/components/AudienceCard';
import BehaviourCard from '@/modules/overview/components/BehaviourCard';
import ContentCard from '@/modules/overview/components/ContentCard';
import InteractionCard from '@/modules/overview/components/InteractionCard';
import Loaded from '@/modules/overview/components/Loaded';
import PerformanceCard from '@/modules/overview/components/PerformanceCard';
import Places from '@/modules/overview/components/Places';
import TechnologyCard from '@/modules/overview/components/TechnologyCard';
import Trends from '@/modules/overview/components/Trends';
import { PERIOD_HINT } from '@/modules/overview/utils/kpis';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { PageHeader, Stack } from '@/shared/components/Page';
import { usePeriodStore } from '@/shared/store/period';

const ROW = 'grid gap-x-12 gap-y-10 lg:grid-cols-2';

const OverviewPage = () => {
    const project = useProject();
    const period = usePeriodStore((state) => state.period);
    const summary = useQuery(overviewApi.summary, [project.id, period]);

    return (
        <>
            <PageHeader title='Resumen' hint={`${project.name} · ${PERIOD_HINT[period]}`} />
            <Stack>
                <Places people={summary.data?.kpis.find((kpi) => kpi.key === 'people')} />
                <Loaded query={summary} skeleton={<SkeletonPlaceholder className='h-80 w-full max-w-none' />}>
                    {(data) => <Trends summary={data} />}
                </Loaded>
                <div className={ROW}>
                    <TechnologyCard />
                    <AcquisitionCard />
                </div>
                <div className={ROW}>
                    <ContentCard />
                    <AudienceCard summary={summary} />
                </div>
                <div className={ROW}>
                    <BehaviourCard />
                    <InteractionCard />
                </div>
                <PerformanceCard />
            </Stack>
        </>
    );
};

export default OverviewPage;
