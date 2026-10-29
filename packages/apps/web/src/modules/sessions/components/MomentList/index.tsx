import { ContainedList, ContainedListItem } from '@carbon/react';
import { useEffect, useRef, type ReactNode } from 'react';
import type { Player } from '@/modules/sessions/hooks/use-replayer';
import { fmt } from '@/shared/utils/format';

export interface Moment{
    key: string;
    at: number;
    content: ReactNode;
}

interface MomentListProps{
    label: string;
    items: Moment[];
    player: Player;
    empty: ReactNode;
}

const currentKey = (items: Moment[], time: number): string | null =>
    items.reduce<string | null>((found, item) => (item.at <= time ? item.key : found), null);

const MomentList = ({ label, items, player, empty }: MomentListProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const current = player.ready ? currentKey(items, player.time) : null;

    useEffect(() => {
        const list = ref.current;
        if(!list || current === null || !player.playing) return;
        const item = list.querySelector<HTMLElement>(`[data-key="${CSS.escape(current)}"]`);
        if(!item) return;
        const top = item.offsetTop;
        if(top < list.scrollTop || top + item.offsetHeight > list.scrollTop + list.clientHeight){
            list.scrollTo({ top: Math.max(0, top - list.clientHeight / 3), behavior: 'smooth' });
        }
    }, [current, player.playing]);

    if(!items.length) return <>{empty}</>;

    return (
        <div ref={ref} className='relative min-h-0 flex-1 overflow-y-auto'>
            <ContainedList label={label} kind='on-page' size='sm' className='list-plain'>
                {items.map((item) => (
                    <ContainedListItem
                        key={item.key}
                        data-key={item.key}
                        onClick={player.ready ? () => player.seek(item.at) : undefined}
                        className={`${item.key === current ? 'bg-fill-strong' : ''} ${player.ready && item.at > player.time ? 'opacity-50' : ''}`}
                    >
                        <span className='flex items-start gap-3'>
                            <span className='w-10 shrink-0 pt-px text-[0.75rem] tabular-nums text-label-2'>{fmt.clock(Math.max(0, item.at) / 1000)}</span>
                            <span className='flex min-w-0 flex-1 items-start gap-3'>{item.content}</span>
                        </span>
                    </ContainedListItem>
                ))}
            </ContainedList>
        </div>
    );
};

export default MomentList;
