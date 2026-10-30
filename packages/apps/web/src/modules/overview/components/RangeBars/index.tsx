import { SkeletonPlaceholder } from '@carbon/react';
import { Dimension } from '@condor/contracts/overview/domain';
import Loaded from '@/modules/overview/components/Loaded';
import { useBreakdown } from '@/modules/overview/hooks/use-breakdown';
import { copy } from '@/modules/overview/i18n';
import { named } from '@/modules/overview/utils/labels';
import { BarsChart } from '@/shared/components/Charts';

const RangeBars = ({ dimension }: { dimension: Dimension }) => {
    const query = useBreakdown(dimension, 10);

    return (
        <Loaded query={query} skeleton={<SkeletonPlaceholder className='h-64 w-full max-w-none' />}>
            {(breakdown) => (
                <BarsChart
                    data={breakdown.slices.map((slice) => ({ label: named(dimension, slice).label, value: slice.value }))}
                    unit={copy.kpis.sessions}
                    className='h-64'
                />
            )}
        </Loaded>
    );
};

export default RangeBars;
