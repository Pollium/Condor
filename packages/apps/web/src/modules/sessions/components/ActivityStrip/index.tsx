const ActivityStrip = ({ values }: { values: number[] }) => {
    const peak = Math.max(...values, 0);
    return (
        <span aria-hidden className='flex h-4 w-28 items-end gap-px'>
            {values.map((value, index) => (
                <span key={index} className='min-w-0 flex-1 bg-foreground/20' style={{ height: `${Math.max(12, peak ? (value / peak) * 100 : 0)}%` }} />
            ))}
        </span>
    );
};

export default ActivityStrip;
