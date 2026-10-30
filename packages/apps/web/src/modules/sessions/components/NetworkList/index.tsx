import { ReplayNetworkEntry } from '@condor/contracts/ingest/wire';
import { Network_3 } from '@carbon/icons-react';
import { useMemo } from 'react';
import MomentList from '@/modules/sessions/components/MomentList';
import type { Player } from '@/modules/sessions/hooks/use-replayer';
import { copy } from '@/modules/sessions/i18n';
import type { Timed } from '@/modules/sessions/utils/replay';
import EmptyState from '@/shared/components/EmptyState';
import { intlLocale } from '@/shared/i18n/locale';

const seconds = new Intl.NumberFormat(intlLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const took = (ms: number) => (ms < 1000 ? `${Math.round(ms)} ms` : `${seconds.format(ms / 1000)} s`);

const NetworkList = ({ entries, player }: { entries: Timed<ReplayNetworkEntry>[]; player: Player }) => {
    const items = useMemo(() => entries.map(({ key, at, entry }) => {
        const danger = entry.failed || entry.status >= 500;
        return {
            key,
            at,
            content: (
                <>
                    <span className='flex min-w-0 flex-1 flex-col'>
                        <span className='truncate text-[0.875rem] text-foreground'>
                            <span className='text-label-2'>{entry.method}</span> {entry.url}
                        </span>
                        <span className='text-[0.75rem] text-label-2'>{entry.failed ? copy.network.failed : took(entry.durationMs)}</span>
                    </span>
                    <span className={`pt-px text-[0.8125rem] tabular-nums ${danger ? 'text-danger' : 'text-label-2'}`}>{entry.status || '—'}</span>
                </>
            )
        };
    }), [entries]);

    return (
        <MomentList
            label={copy.panel.network}
            items={items}
            player={player}
            empty={<EmptyState compact icon={Network_3} title={copy.network.empty} description={copy.network.emptyHint} />}
        />
    );
};

export default NetworkList;
