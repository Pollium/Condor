import { ConsoleLevel, ReplayConsoleEntry } from '@condor/contracts/ingest/wire';
import { Debug, Information, Terminal, WarningAlt } from '@carbon/icons-react';
import { useMemo } from 'react';
import MomentList from '@/modules/sessions/components/MomentList';
import type { Player } from '@/modules/sessions/hooks/use-replayer';
import type { Timed } from '@/modules/sessions/utils/replay';
import EmptyState from '@/shared/components/EmptyState';

const ICONS: Record<ConsoleLevel, typeof Terminal> = { log: Terminal, debug: Terminal, info: Information, warn: WarningAlt, error: Debug };

const ConsoleList = ({ entries, player }: { entries: Timed<ReplayConsoleEntry>[]; player: Player }) => {
    const items = useMemo(() => entries.map(({ key, at, entry }) => {
        const Icon = ICONS[entry.level] ?? Terminal;
        const danger = entry.level === 'error';
        return {
            key,
            at,
            content: (
                <>
                    <Icon size={16} className={`mt-0.5 shrink-0 ${danger ? 'text-danger' : 'text-label-2'}`} />
                    <span className={`min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-[0.75rem] leading-relaxed ${danger ? 'text-danger' : 'text-foreground'}`}>
                        {entry.message}
                    </span>
                </>
            )
        };
    }), [entries]);

    return (
        <MomentList
            label='Consola'
            items={items}
            player={player}
            empty={<EmptyState compact icon={Terminal} title='Consola vacía' description='La grabación no registró mensajes de consola.' />}
        />
    );
};

export default ConsoleList;
