import { SessionDetail } from '@condor/contracts/sessions/domain';
import { join } from '@/modules/sessions/utils/labels';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import { fmt } from '@/shared/utils/format';

const count = (value: number, one: string, many: string) => (value ? `${fmt.n(value)} ${value === 1 ? one : many}` : null);

const SessionStats = ({ session }: { session: SessionDetail }) => {
    const { rage, dead, errors, uturns } = session.signals;
    const frictions = rage + dead + errors + uturns;

    return (
        <StatRow columns={4}>
            <StatTile label='Duración' value={fmt.clock(session.duration)} hint={`${fmt.duration(session.activeDuration)} con actividad`} />
            <StatTile label='Páginas' value={fmt.n(session.pageviews)} hint={join(session.entryPath, session.exitPath && session.exitPath !== session.entryPath ? `sale en ${session.exitPath}` : null)} />
            <StatTile label='Eventos' value={fmt.n(session.events)} hint={session.converted ? 'Convirtió' : 'Sin conversión'} />
            <StatTile
                label='Fricción'
                value={fmt.n(frictions)}
                hint={join(count(errors, 'error', 'errores'), count(rage, 'clic de rabia', 'clics de rabia'), count(dead, 'clic muerto', 'clics muertos'), count(uturns, 'vuelta atrás', 'vueltas atrás')) || 'Sin señales'}
            />
        </StatRow>
    );
};

export default SessionStats;
