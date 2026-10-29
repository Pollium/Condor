import { FunnelResult } from '@condor/contracts/funnels/domain';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import { median, pointsDelta } from '@/modules/funnels/utils/funnel-copy';
import { fmt } from '@/shared/utils/format';

const FunnelStats = ({ result }: { result: FunnelResult }) => {
    const first = result.steps[0];
    const last = result.steps[result.steps.length - 1];
    const worst = result.steps.slice(1).reduce((low, step) => (step.fromPrevious < low.fromPrevious ? step : low), result.steps[1]);

    return (
        <StatRow columns={4}>
            <StatTile label='Conversión total' value={fmt.pct(result.conversion)} hint={pointsDelta(result.conversion, result.previousConversion)} />
            <StatTile label='Completan' value={fmt.n(last.people)} hint={`de ${fmt.n(first.people)} que empiezan`} />
            <StatTile label='Tiempo mediano' value={median(result.medianSeconds)} hint='Del primer paso al último' />
            <StatTile
                label='Mayor abandono'
                value={first.people ? fmt.pct(1 - worst.fromPrevious) : '—'}
                hint={first.people ? `Antes de «${worst.label}»` : 'Aún nadie empieza'}
            />
        </StatRow>
    );
};

export default FunnelStats;
