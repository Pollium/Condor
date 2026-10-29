import { useNavigate } from 'react-router-dom';
import Loaded from '@/modules/overview/components/Loaded';
import Tabbed from '@/modules/overview/components/Tabbed';
import { useBreakdown } from '@/modules/overview/hooks/use-breakdown';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { named } from '@/modules/overview/utils/labels';
import { RowList } from '@/shared/components/RowList';
import { fmt } from '@/shared/utils/format';

const EMPTY = <p className='text-[0.8125rem] text-label-2'>Sin datos en este periodo.</p>;

const Events = () => {
    const query = useBreakdown('event');

    return (
        <Loaded query={query}>
            {(breakdown) => (
                <RowList
                    label='Eventos propios'
                    empty={EMPTY}
                    rows={breakdown.slices.map((slice) => ({
                        id: slice.id,
                        text: slice.label,
                        title: slice.label,
                        subtitle: slice.secondary === undefined ? undefined : `${fmt.n(slice.secondary)} ${slice.secondary === 1 ? 'persona' : 'personas'}`,
                        value: <span className='text-label-2'>{fmt.n(slice.value)}</span>,
                        meta: fmt.pct(breakdown.total ? slice.value / breakdown.total : 0)
                    }))}
                />
            )}
        </Loaded>
    );
};

const Frustration = () => {
    const navigate = useNavigate();
    const { projectId } = useScope();
    const query = useBreakdown('frustration');

    return (
        <Loaded query={query}>
            {(breakdown) => (
                <RowList
                    label='Señales de frustración'
                    onOpen={() => navigate(`/${projectId}/sesiones`)}
                    empty={EMPTY}
                    rows={[...breakdown.slices].sort((x, y) => y.value - x.value).map((slice) => {
                        const signal = named('frustration', slice);
                        return {
                            id: slice.id,
                            text: signal.label,
                            title: signal.label,
                            subtitle: signal.detail,
                            value: <span className='text-label-2'>{fmt.n(slice.value)}</span>,
                            meta: fmt.pct(breakdown.total ? slice.value / breakdown.total : 0)
                        };
                    })}
                />
            )}
        </Loaded>
    );
};

const InteractionCard = () => (
    <Tabbed
        title='Interacción'
        tabs={[
            { id: 'events', label: 'Eventos', content: <Events /> },
            { id: 'frustration', label: 'Frustración', content: <Frustration /> }
        ]}
    />
);

export default InteractionCard;
