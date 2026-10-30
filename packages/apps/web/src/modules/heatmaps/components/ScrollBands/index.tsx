import { ScrollReach } from '@condor/contracts/heatmaps/domain';
import { copy } from '@/modules/heatmaps/i18n';
import { fmt } from '@/shared/utils/format';

interface ScrollBandsProps{
    reach: ScrollReach[];
    height: number;
}

const PILL = 'absolute whitespace-nowrap bg-black/60 px-2.5 py-0.5 text-[0.8125rem] tabular-nums text-white';

const ScrollBands = ({ reach, height }: ScrollBandsProps) => {
    const half = reach.find((entry) => entry.share < 0.5);

    return (
        <div className='pointer-events-none absolute inset-0'>
            {reach.slice(0, -1).map((entry, index) => {
                const top = (entry.depth / 100) * height;
                const bottom = (reach[index + 1].depth / 100) * height;
                return (
                    <div key={entry.depth} className='absolute inset-x-0' style={{ top, height: bottom - top, background: `rgba(0, 0, 0, ${(1 - entry.share) * 0.6})` }}>
                        {bottom - top >= 22 ? <span className={`${PILL} right-3 top-1/2 -translate-y-1/2`}>{fmt.pct(entry.share)}</span> : null}
                    </div>
                );
            })}
            {half ? (
                <div className='absolute inset-x-0' style={{ top: (half.depth / 100) * height }}>
                    <div className='h-px w-full bg-black/50' />
                    <span className={`${PILL} left-3 top-2`}>{copy.frame.half}</span>
                </div>
            ) : null}
        </div>
    );
};

export default ScrollBands;
