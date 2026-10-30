import { Summary } from '@condor/contracts/overview/domain';
import { Query } from '@condor/ui/contracts/api';
import Loaded from '@/modules/overview/components/Loaded';
import Shares from '@/modules/overview/components/Shares';
import Stats from '@/modules/overview/components/Stats';
import Tabbed from '@/modules/overview/components/Tabbed';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { copy } from '@/modules/overview/i18n';
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
                    { label: copy.audience.returning, value: `${fmt.pct(share)} · ${fmt.n(returning)}` },
                    { label: copy.audience.fresh, value: `${fmt.pct(1 - share)} · ${fmt.n(fresh)}` }
                ]}
            />
            <div className='flex h-2 gap-0.5'>
                <span className='h-full bg-accent' style={{ width: `${share * 100}%` }} />
                <span className='h-full flex-1 bg-fill-strong' />
            </div>
            <Legend
                items={[
                    { label: copy.audience.returning, className: 'bg-accent' },
                    { label: copy.audience.fresh, className: 'bg-fill-strong' }
                ]}
            />
            <div className='flex flex-col gap-1 pt-2'>
                <p className='text-[0.75rem] text-label-2'>{copy.audience.visits}</p>
                <Shares label={copy.audience.visits} dimension='frequency' />
            </div>
        </div>
    );
};

const Now = () => {
    const { projectId } = useScope();
    const live = useLive(projectId);
    if(live === null) return <p className='text-[0.8125rem] text-label-2'>{copy.audience.connecting}</p>;

    return (
        <div className='flex flex-col gap-4 pt-1'>
            <div>
                <p className='text-[2.5rem] font-light leading-none tabular-nums'>{fmt.n(live.count)}</p>
                <p className='mt-1.5 text-[0.8125rem] text-label-2'>{copy.audience.liveNow(live.count)}</p>
            </div>
            <RowList
                label={copy.audience.livePages}
                empty={<p className='text-[0.8125rem] text-label-2'>{copy.audience.nobody}</p>}
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
        title={copy.audience.title}
        tabs={[
            {
                id: 'returning',
                label: copy.audience.returningTab,
                content: <Loaded query={summary}>{(data) => <Recurrence summary={data} />}</Loaded>
            },
            { id: 'now', label: copy.audience.nowTab, content: <Now /> }
        ]}
    />
);

export default AudienceCard;
