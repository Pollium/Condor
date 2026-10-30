import { SessionEvent } from '@condor/contracts/sessions/domain';
import { Activity } from '@carbon/icons-react';
import { useMemo } from 'react';
import MomentList from '@/modules/sessions/components/MomentList';
import type { Player } from '@/modules/sessions/hooks/use-replayer';
import { copy } from '@/modules/sessions/i18n';
import { describe, TIMELINE_TYPES } from '@/modules/sessions/utils/timeline';
import EmptyState from '@/shared/components/EmptyState';

interface TimelineListProps{
    timeline: SessionEvent[];
    lead: number;
    player: Player;
}

const TimelineList = ({ timeline, lead, player }: TimelineListProps) => {
    const items = useMemo(() => timeline.filter((entry) => TIMELINE_TYPES.has(entry.type)).map((entry) => {
        const { title, detail, danger } = describe(entry);
        return {
            key: entry.id,
            at: entry.offsetMs - lead,
            content: (
                <span className='flex min-w-0 flex-1 flex-col'>
                    <span className={`break-words text-[0.875rem] ${danger ? 'text-danger' : 'text-foreground'}`}>{title}</span>
                    {detail ? <span className='break-words text-[0.75rem] text-label-2'>{detail}</span> : null}
                </span>
            )
        };
    }), [timeline, lead]);

    return (
        <MomentList
            label={copy.timeline.label}
            items={items}
            player={player}
            empty={<EmptyState compact icon={Activity} title={copy.timeline.empty} description={copy.timeline.emptyHint} />}
        />
    );
};

export default TimelineList;
