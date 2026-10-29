import { Summary } from '@condor/contracts/overview/domain';
import { Query } from '@condor/ui/contracts/api';
import Loaded from '@/modules/overview/components/Loaded';
import Shares from '@/modules/overview/components/Shares';
import Stats from '@/modules/overview/components/Stats';
import Tabbed from '@/modules/overview/components/Tabbed';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { useLive } from '@/modules/live/hooks/use-live';
import { Legend } from '@/shared/components/Page';
import { RowList } from '@/shared/components/RowList';
import { fmt } from '@/shared/utils/format';

const Recurrence = ({ summary }: { summary: Summary }) => {
    const fresh = summary.audience.reduce((sum, point) => sum + point.fresh, 0);
    const returning = summary.audience.reduce((sum, point) => sum + point.returning, 0);
    const share = fresh + returning ? returning / (fresh + returning) : 0;

    return (
        <div className='flex flex-col gap-4 pt-1'>
            <Stats
                items={[
                    { label: 'Recurrentes', value: `${fmt.pct(share)} · ${fmt.n(returning)}` },
                    { label: 'Nuevas', value: `${fmt.pct(1 - share)} · ${fmt.n(fresh)}` }
                ]}
            />
            <div className='flex h-2 gap-0.5'>
                <span className='h-full bg-accent' style={{ width: `${share * 100}%` }} />
                <span className='h-full flex-1 bg-fill-strong' />
            </div>
            <Legend
                items={[
                    { label: 'Recurrentes', className: 'bg-accent' },
                    { label: 'Nuevas', className: 'bg-fill-strong' }
                ]}
            />
            <div className='flex flex-col gap-1 pt-2'>
                <p className='text-[0.75rem] text-label-2'>Cuántas veces vinieron</p>
                <Shares label='Cuántas veces vinieron' dimension='frequency' />
            </div>
        </div>
    );
};

const Now = () => {
    const { projectId } = useScope();
    const live = useLive(projectId);
    if(live === null) return <p className='text-[0.8125rem] text-label-2'>Conectando…</p>;

    return (
        <div className='flex flex-col gap-4 pt-1'>
            <div>
                <p className='text-[2.5rem] font-light leading-none tabular-nums'>{fmt.n(live.count)}</p>
                <p className='mt-1.5 text-[0.8125rem] text-label-2'>{live.count === 1 ? 'persona en la app ahora' : 'personas en la app ahora'}</p>
            </div>
            <RowList
                label='Páginas con personas ahora'
                empty={<p className='text-[0.8125rem] text-label-2'>Nadie está navegando en este momento.</p>}
                rows={live.pages.slice(0, 6).map((page) => ({
                    id: page.path,
                    text: page.path,
                    title: page.path,
                    value: <span className='text-label-2'>{fmt.n(page.people)}</span>,
                    share: live.count ? page.people / live.count : 0
                }))}
            />
        </div>
    );
};

const AudienceCard = ({ summary }: { summary: Query<Summary> }) => (
    <Tabbed
        title='Audiencia'
        tabs={[
            {
                id: 'returning',
                label: 'Recurrencia',
                content: <Loaded query={summary}>{(data) => <Recurrence summary={data} />}</Loaded>
            },
            { id: 'now', label: 'Ahora', content: <Now /> }
        ]}
    />
);

export default AudienceCard;
