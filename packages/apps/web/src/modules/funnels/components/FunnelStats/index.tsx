import { FunnelResult } from '@condor/contracts/funnels/domain';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import { copy } from '@/modules/funnels/i18n';
import { median, pointsDelta } from '@/modules/funnels/utils/funnel-copy';
import { fmt } from '@/shared/utils/format';

const FunnelStats = ({ result }: { result: FunnelResult }) => {
    const first = result.steps[0];
    const last = result.steps[result.steps.length - 1];
    const worst = result.steps.slice(1).reduce((low, step) => (step.fromPrevious < low.fromPrevious ? step : low), result.steps[1]);

    return (
        <StatRow columns={4}>
            <StatTile label={copy.stats.conversion} value={fmt.pct(result.conversion)} hint={pointsDelta(result.conversion, result.previousConversion)} />
            <StatTile label={copy.stats.complete} value={fmt.n(last.people)} hint={copy.stats.ofStarting(first.people)} />
            <StatTile label={copy.stats.medianTime} value={median(result.medianSeconds)} hint={copy.stats.firstToLast} />
            <StatTile
                label={copy.stats.biggestDrop}
                value={first.people ? fmt.pct(1 - worst.fromPrevious) : '—'}
                hint={first.people ? copy.stats.before(worst.label) : copy.stats.noneYet}
            />
        </StatRow>
    );
};

export default FunnelStats;
