import type { ReactNode } from 'react';

interface StatTileProps{
    label: string;
    value: string;
    hint?: string;
    children?: ReactNode;
}

const StatTile = ({ label, value, hint, children }: StatTileProps) => (
    <section className='flex min-w-0 flex-col'>
        <h2 className='truncate text-[0.8125rem] text-label-2'>{label}</h2>
        <p className='mt-1 truncate text-[2rem] font-light leading-tight tabular-nums text-foreground'>{value}</p>
        {hint ? <p className='mt-0.5 truncate text-[0.8125rem] text-label-2'>{hint}</p> : null}
        {children}
    </section>
);

const COLUMNS = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5'
} as const;

export const StatRow = ({ columns, children }: { columns: keyof typeof COLUMNS; children: ReactNode }) => (
    <div className={`grid gap-x-8 gap-y-6 ${COLUMNS[columns]}`}>{children}</div>
);

export default StatTile;
