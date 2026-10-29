interface Stat{
    label: string;
    value: string;
}

const Stats = ({ items }: { items: Stat[] }) => (
    <dl className='grid gap-4' style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((stat) => (
            <div key={stat.label} className='min-w-0'>
                <dt className='truncate text-[0.75rem] text-label-2'>{stat.label}</dt>
                <dd className='truncate text-[1.25rem] font-light tabular-nums'>{stat.value}</dd>
            </div>
        ))}
    </dl>
);

export default Stats;
