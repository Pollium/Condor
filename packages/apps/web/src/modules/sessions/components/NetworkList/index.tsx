import { ReplayNetworkEntry } from '@condor/contracts/ingest/wire';
import { Network_3 } from '@carbon/icons-react';
import { useMemo } from 'react';
import MomentList from '@/modules/sessions/components/MomentList';
import type { Player } from '@/modules/sessions/hooks/use-replayer';
import type { Timed } from '@/modules/sessions/utils/replay';
import EmptyState from '@/shared/components/EmptyState';

const took = (ms: number) => (ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`);

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
                        <span className='text-[0.75rem] text-label-2'>{entry.failed ? 'Falló' : took(entry.durationMs)}</span>
                    </span>
                    <span className={`pt-px text-[0.8125rem] tabular-nums ${danger ? 'text-danger' : 'text-label-2'}`}>{entry.status || '—'}</span>
                </>
            )
        };
    }), [entries]);

    return (
        <MomentList
            label='Red'
            items={items}
            player={player}
            empty={<EmptyState compact icon={Network_3} title='Sin peticiones' description='La grabación no registró peticiones de red.' />}
        />
    );
};

export default NetworkList;
