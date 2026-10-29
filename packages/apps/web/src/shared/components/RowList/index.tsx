import { ContainedList, ContainedListItem, ProgressBar } from '@carbon/react';
import type { ReactNode } from 'react';

export interface Row{
    id: string;
    title: ReactNode;
    text: string;
    subtitle?: ReactNode;
    value?: ReactNode;
    meta?: ReactNode;
    share?: number;
    leading?: ReactNode;
    trailing?: ReactNode;
    tone?: 'danger';
    dimmed?: boolean;
}

interface RowListProps{
    label: string;
    rows: Row[];
    onOpen?: (id: string) => void;
    selected?: string | null;
    onSelect?: (id: string) => void;
    empty?: ReactNode;
    className?: string;
    valueClassName?: string;
}

export const RowList = ({ label, rows, onOpen, selected, onSelect, empty, className = '', valueClassName = '' }: RowListProps) => {
    if(!rows.length && empty) return <>{empty}</>;
    const clickable = onSelect !== undefined || onOpen !== undefined;

    return (
        <ContainedList label={label} kind='on-page' className={`list-plain ${className}`}>
            {rows.map((row) => (
                <ContainedListItem
                    key={row.id}
                    onClick={clickable ? () => (onSelect ? onSelect(row.id) : onOpen?.(row.id)) : undefined}
                    className={`${selected === row.id ? 'bg-fill-strong' : ''} ${row.dimmed ? 'opacity-50' : ''}`}
                >
                    <span className='flex min-w-0 items-center gap-3' onDoubleClick={onOpen && onSelect ? () => onOpen(row.id) : undefined}>
                        {row.leading}
                        <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                            <span className={`truncate text-[0.875rem] ${row.tone === 'danger' ? 'text-danger' : 'text-foreground'}`}>{row.title}</span>
                            {row.subtitle ? <span className='truncate text-[0.75rem] text-label-2'>{row.subtitle}</span> : null}
                            {row.share !== undefined ? (
                                <ProgressBar label={row.text} hideLabel size='small' value={Math.max(2, Math.min(1, row.share) * 100)} className='mt-1.5' />
                            ) : null}
                        </span>
                        {row.trailing}
                        {row.value !== undefined || row.meta !== undefined ? (
                            <span className={`flex shrink-0 flex-col items-end gap-0.5 self-start ${valueClassName}`}>
                                {row.value !== undefined ? <span className='text-[0.875rem] tabular-nums text-foreground'>{row.value}</span> : null}
                                {row.meta !== undefined ? <span className='max-w-full truncate whitespace-nowrap text-[0.75rem] tabular-nums text-label-2'>{row.meta}</span> : null}
                            </span>
                        ) : null}
                    </span>
                </ContainedListItem>
            ))}
        </ContainedList>
    );
};
