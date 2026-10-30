import { Dimension } from '@condor/contracts/overview/domain';
import Loaded from '@/modules/overview/components/Loaded';
import { useBreakdown } from '@/modules/overview/hooks/use-breakdown';
import { copy } from '@/modules/overview/i18n';
import { named } from '@/modules/overview/utils/labels';
import { ShareList } from '@/shared/components/ShareList';

interface SharesProps{
    label: string;
    dimension: Dimension;
    show?: 'share' | 'count';
    onOpen?: (id: string) => void;
}

const Shares = ({ label, dimension, show, onOpen }: SharesProps) => {
    const query = useBreakdown(dimension);

    return (
        <Loaded query={query}>
            {(breakdown) => breakdown.slices.length === 0 ? (
                <p className='text-[0.8125rem] text-label-2'>{copy.noData}</p>
            ) : (
                <ShareList
                    label={label}
                    items={breakdown.slices.map((slice) => ({ id: slice.id, value: slice.value, ...named(dimension, slice) }))}
                    total={breakdown.total}
                    show={show}
                    onOpen={onOpen}
                />
            )}
        </Loaded>
    );
};

export default Shares;
