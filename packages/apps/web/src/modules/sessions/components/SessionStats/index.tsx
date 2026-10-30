import { SessionDetail } from '@condor/contracts/sessions/domain';
import { copy } from '@/modules/sessions/i18n';
import { join } from '@/modules/sessions/utils/labels';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import { fmt } from '@/shared/utils/format';

const count = (value: number, phrase: (value: number) => string) => (value ? phrase(value) : null);

const SessionStats = ({ session }: { session: SessionDetail }) => {
    const { rage, dead, errors, uturns } = session.signals;
    const frictions = rage + dead + errors + uturns;

    return (
        <StatRow columns={4}>
            <StatTile label={copy.stats.duration} value={fmt.clock(session.duration)} hint={copy.stats.active(fmt.duration(session.activeDuration))} />
            <StatTile label={copy.stats.pages} value={fmt.n(session.pageviews)} hint={join(session.entryPath, session.exitPath && session.exitPath !== session.entryPath ? copy.stats.exitsOn(session.exitPath) : null)} />
            <StatTile label={copy.stats.events} value={fmt.n(session.events)} hint={session.converted ? copy.stats.converted : copy.stats.notConverted} />
            <StatTile
                label={copy.stats.friction}
                value={fmt.n(frictions)}
                hint={join(count(errors, copy.counts.errors), count(rage, copy.counts.rage), count(dead, copy.counts.dead), count(uturns, copy.counts.uturns)) || copy.stats.noSignals}
            />
        </StatRow>
    );
};

export default SessionStats;
