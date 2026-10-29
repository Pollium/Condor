import { Retention } from '@condor/contracts/retention/domain';
import { cohortLabel, people, UNIT } from '@/modules/retention/utils/cohort-copy';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import { fmt } from '@/shared/utils/format';

const LATER = 4;

const RetentionStats = ({ retention }: { retention: Retention }) => {
    const unit = UNIT[retention.grain];
    const reaching = (index: number) => retention.cohorts.filter((cohort) => cohort.values.length > index).length;
    const averaged = (index: number) => {
        const count = reaching(index);
        if(retention.average[index] === undefined || !count) return { value: '—', hint: 'Aún no hay cohortes que lleguen tan lejos' };
        return { value: fmt.pct(retention.average[index]), hint: `Media ponderada de ${count} ${count === 1 ? 'cohorte' : 'cohortes'}` };
    };
    const first = averaged(1);
    const later = averaged(LATER);
    const best = retention.cohorts
        .filter((cohort) => cohort.values.length > 1 && cohort.size > 0)
        .reduce<Retention['cohorts'][number] | null>((top, cohort) => (top === null || cohort.values[1] > top.values[1] ? cohort : top), null);

    return (
        <StatRow columns={3}>
            <StatTile label={`Vuelven ${unit.one} 1`} value={first.value} hint={first.hint} />
            <StatTile label={`Siguen ${unit.one} ${LATER}`} value={later.value} hint={later.hint} />
            <StatTile
                label='Mejor cohorte'
                value={best ? fmt.pct(best.values[1]) : '—'}
                hint={best ? `${retention.grain === 'week' ? 'Semana del' : 'Llegó el'} ${cohortLabel(best.start)} · ${people(best.size)}` : 'Aún no hay cohortes que vuelvan'}
            />
        </StatRow>
    );
};

export default RetentionStats;
