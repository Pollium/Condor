import { useNavigate } from 'react-router-dom';
import Loaded from '@/modules/overview/components/Loaded';
import Tabbed from '@/modules/overview/components/Tabbed';
import { useBreakdown } from '@/modules/overview/hooks/use-breakdown';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { copy } from '@/modules/overview/i18n';
import { named } from '@/modules/overview/utils/labels';
import { RowList } from '@/shared/components/RowList';
import { copy as shared } from '@/shared/i18n';
import { fmt } from '@/shared/utils/format';

const EMPTY = <p className='text-[0.8125rem] text-label-2'>{copy.noData}</p>;

const Events = () => {
    const query = useBreakdown('event');

    return (
        <Loaded query={query}>
            {(breakdown) => (
                <RowList
                    label={copy.interaction.customEvents}
                    empty={EMPTY}
                    rows={breakdown.slices.map((slice) => ({
                        id: slice.id,
                        text: slice.label,
                        title: slice.label,
                        subtitle: slice.secondary === undefined ? undefined : copy.interaction.people(slice.secondary),
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
                    label={copy.interaction.signals}
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
        title={copy.interaction.title}
        tabs={[
            { id: 'events', label: shared.views.events, content: <Events /> },
            { id: 'frustration', label: copy.interaction.frustration, content: <Frustration /> }
        ]}
    />
);

export default InteractionCard;
