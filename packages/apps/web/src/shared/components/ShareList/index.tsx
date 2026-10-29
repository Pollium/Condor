import { ContainedList, ContainedListItem } from '@carbon/react';
import type { ReactNode } from 'react';
import { fmt } from '@/shared/utils/format';

export interface Share{
    id: string;
    label: string;
    value: number;
    detail?: string;
    leading?: ReactNode;
}

interface ShareListProps{
    label: string;
    items: Share[];
    total: number;
    limit?: number;
    show?: 'share' | 'count';
    onOpen?: (id: string) => void;
}

export const ShareList = ({ label, items, total, limit = 6, show = 'share', onOpen }: ShareListProps) => (
    <ContainedList label={label} kind='on-page' className='list-plain'>
        {items.slice(0, limit).map((item) => (
            <ContainedListItem key={item.id} onClick={onOpen ? () => onOpen(item.id) : undefined} className='group'>
                <span className='flex min-w-0 items-center gap-3'>
                    {item.leading}
                    <span className='min-w-0 flex-1 truncate text-[0.875rem] text-foreground'>
                        {item.label}
                        {item.detail ? <span className='hidden text-label-3 group-hover:inline'> · {item.detail}</span> : null}
                    </span>
                    <span className='shrink-0 text-[0.75rem] tabular-nums text-label-3 opacity-0 group-hover:opacity-100'>
                        {show === 'share' ? fmt.n(item.value) : fmt.pct(item.value / total)}
                    </span>
                    <span className='w-14 shrink-0 text-right text-[0.875rem] tabular-nums text-label-2'>{show === 'share' ? fmt.pct(item.value / total) : fmt.n(item.value)}</span>
                </span>
            </ContainedListItem>
        ))}
    </ContainedList>
);
