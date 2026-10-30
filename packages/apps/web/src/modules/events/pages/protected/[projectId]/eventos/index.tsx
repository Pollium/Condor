import { InlineNotification } from '@carbon/react';
import { ChartMultitype } from '@carbon/icons-react';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { useSearchParams } from 'react-router-dom';
import { eventsApi } from '@/modules/events/api/api';
import EventDetailPanel from '@/modules/events/components/EventDetailPanel';
import SegmentMenu from '@/modules/events/components/SegmentMenu';
import { useSegmentQuery } from '@/modules/events/hooks/use-segment';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { people } from '@/modules/retention/utils/cohort-copy';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/Page';
import { RowList } from '@/shared/components/RowList';
import { usePeriodStore } from '@/shared/store/period';
import { errorCopy } from '@/shared/utils/error-copy';
import { fmt } from '@/shared/utils/format';

const EventsPage = () => {
    const project = useProject();
    const period = usePeriodStore((state) => state.period);
    const segment = useSegmentQuery(project.id);
    const query = { period, ...segment };
    const [params, setParams] = useSearchParams();
    const list = useQuery(eventsApi.list, [project.id, query]);
    const rows = list.data ?? [];
    const name = params.get('evento') ?? rows[0]?.name;
    const detail = useQuery(eventsApi.detail, [name ? project.id : undefined, name ?? '', query]);
    const busiest = rows[0]?.count ?? 0;
    const failure = errorCopy()(list.error ?? detail.error);

    const select = (id: string) => setParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set('evento', id);
        return next;
    }, { replace: true });

    return (
        <div className='w-full'>
            <PageHeader title='Eventos' hint={list.data ? `${fmt.n(rows.length)} eventos propios en este periodo` : undefined}>
                <SegmentMenu projectId={project.id} />
            </PageHeader>

            {failure ? <InlineNotification kind='error' lowContrast hideCloseButton title={failure} className='mb-6' /> : null}

            <div className='grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]'>
                <RowList
                    label='Eventos propios'
                    selected={name ?? null}
                    onSelect={select}
                    empty={list.data ? (
                        <EmptyState
                            compact
                            icon={ChartMultitype}
                            title='Aún no hay eventos propios'
                            description='Llama a condor.track("nombre", { ... }) desde tu app o envíalos desde tu servidor y aparecerán aquí.'
                        />
                    ) : undefined}
                    rows={rows.map((event) => ({
                        id: event.name,
                        text: event.name,
                        title: event.name,
                        subtitle: `${people(event.people)} · ${fmt.ago(event.lastSeenAt)}`,
                        value: fmt.n(event.count),
                        share: busiest === 0 ? 0 : event.count / busiest
                    }))}
                />
                {detail.data && detail.data.name === name ? <EventDetailPanel projectId={project.id} detail={detail.data} query={query} /> : null}
            </div>
        </div>
    );
};

export default EventsPage;
