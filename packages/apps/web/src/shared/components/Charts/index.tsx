import { Tooltip as HintTip } from '@carbon/react';
import { heatFill, mixFill } from '@/shared/utils/heat';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { copy } from '@/shared/i18n';
import { intlLocale } from '@/shared/i18n/locale';
import { fmt } from '@/shared/utils/format';
import { AXIS_TICK, CURSOR_FILL, GRID_STROKE, MARGIN } from '@/shared/utils/chart-style';

export const Sparkline = ({ values, className = 'mt-3 h-10' }: { values: readonly number[]; className?: string }) => {
    const points = values.map((value, index) => ({ index, value }));

    return (
        <div className={className}>
            <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                    <Area type='monotone' dataKey='value' stroke='var(--accent)' strokeWidth={1.5} fill='none' isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

interface TooltipRow{
    label: string;
    value: string;
    swatch: string;
}

export const ChartTooltip = ({ title, rows }: { title: string; rows: TooltipRow[] }) => (
    <div className='min-w-40 bg-overlay px-3 py-2.5 shadow-[var(--overlay-shadow)]'>
        <p className='text-[0.75rem] font-semibold text-foreground'>{title}</p>
        <div className='mt-1.5 flex flex-col gap-1'>
            {rows.map((row) => (
                <span key={row.label} className='flex items-center gap-2 text-[0.75rem] text-muted'>
                    <span className={`h-1 w-3 ${row.swatch}`} />
                    <span className='flex-1'>{row.label}</span>
                    <span className='tabular-nums text-foreground'>{row.value}</span>
                </span>
            ))}
        </div>
    </div>
);

export interface DayTraffic{
    date: string;
    label: string;
    sessions: number;
    errored: number;
}

export const SessionsChart = ({ days, className = 'h-52' }: { days: DayTraffic[]; className?: string }) => {
    const data = days.map((day) => ({ ...day, clean: day.sessions - day.errored }));

    return (
        <div className='flex flex-1 flex-col gap-3'>
            <div className={className}>
                <ResponsiveContainer width='100%' height='100%'>
                    <ComposedChart data={data} margin={MARGIN}>
                        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                        <XAxis dataKey='label' tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={24} />
                        <YAxis allowDecimals={false} tickFormatter={fmt.k} width={40} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{ fill: CURSOR_FILL }}
                            content={({ active, payload }) => {
                                const day = active ? (payload?.[0]?.payload as DayTraffic | undefined) : undefined;
                                if(!day) return null;
                                return (
                                    <ChartTooltip
                                        title={day.label}
                                        rows={[
                                            { label: copy.chart.sessions, value: fmt.n(day.sessions), swatch: 'bg-accent' },
                                            { label: copy.chart.errored, value: fmt.n(day.errored), swatch: 'bg-danger' }
                                        ]}
                                    />
                                );
                            }}
                        />
                        <Bar dataKey='clean' stackId='traffic' fill='var(--accent)' maxBarSize={22} isAnimationActive={false} />
                        <Bar dataKey='errored' stackId='traffic' fill='var(--danger)' maxBarSize={22} isAnimationActive={false} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const BarsChart = ({ data, unit, className = 'h-44' }: { data: { label: string; value: number }[]; unit: string; className?: string }) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div className={className}>
            <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={data} margin={MARGIN}>
                    <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                    <XAxis dataKey='label' tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} />
                    <YAxis allowDecimals={false} tickFormatter={fmt.k} width={40} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip
                        cursor={{ fill: CURSOR_FILL }}
                        content={({ active, payload }) => {
                            const entry = active ? (payload?.[0]?.payload as { label: string; value: number } | undefined) : undefined;
                            if(!entry) return null;
                            return (
                                <ChartTooltip
                                    title={entry.label}
                                    rows={[{ label: unit, value: `${fmt.n(entry.value)} · ${fmt.pct(total ? entry.value / total : 0)}`, swatch: 'bg-accent' }]}
                                />
                            );
                        }}
                    />
                    <Bar dataKey='value' fill='var(--accent)' maxBarSize={28} isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const TrendChart = ({
    data,
    kind,
    unit,
    format,
    className = 'h-56'
}: {
    data: { label: string; value: number }[];
    kind: 'bar' | 'line';
    unit: string;
    format: (value: number) => string;
    className?: string;
}) => (
    <div className={className}>
        <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={data} margin={MARGIN}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey='label' tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis tickFormatter={format} width={52} tick={AXIS_TICK} axisLine={false} tickLine={false} domain={kind === 'line' ? ['auto', 'auto'] : [0, 'auto']} />
                <Tooltip
                    cursor={kind === 'bar' ? { fill: CURSOR_FILL } : { stroke: GRID_STROKE }}
                    content={({ active, payload }) => {
                        const entry = active ? (payload?.[0]?.payload as { label: string; value: number } | undefined) : undefined;
                        if(!entry) return null;
                        return <ChartTooltip title={entry.label} rows={[{ label: unit, value: format(entry.value), swatch: 'bg-accent' }]} />;
                    }}
                />
                {kind === 'bar' ? (
                    <Bar dataKey='value' fill='var(--accent)' maxBarSize={22} isAnimationActive={false} />
                ) : (
                    <Area
                        type='monotone'
                        dataKey='value'
                        stroke='var(--accent)'
                        strokeWidth={2}
                        fill='var(--accent)'
                        fillOpacity={0.06}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                        isAnimationActive={false}
                    />
                )}
            </ComposedChart>
        </ResponsiveContainer>
    </div>
);

const weekdayName = new Intl.DateTimeFormat(intlLocale, { weekday: 'short', timeZone: 'UTC' });
const WEEKDAYS = Array.from({ length: 7 }, (_, index) => {
    const name = weekdayName.format(new Date(Date.UTC(2024, 0, 1 + index)));
    return name.charAt(0).toUpperCase() + name.slice(1);
});
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_TICKS = new Set([0, 3, 6, 9, 12, 15, 18, 21]);
const LEGEND_MIXES = [4, 20, 36, 52, 70, 86] as const;

const padHour = (hour: number) => String(hour).padStart(2, '0');

export interface HeatCell{
    isoWeekday: number;
    hour: number;
    value: number;
}

export const WeekHeatmap = ({ cells, unit }: { cells: HeatCell[]; unit: string }) => {
    const peak = Math.max(0, ...cells.map((cell) => cell.value));
    const counted = new Map(cells.map((cell) => [`${cell.isoWeekday}-${cell.hour}`, cell.value]));

    return (
        <div className='flex flex-col gap-0.5'>
            {WEEKDAYS.map((weekday, index) => (
                <div key={weekday} className='flex items-center gap-0.5'>
                    <span className='w-7 shrink-0 text-[0.625rem] text-muted'>{weekday}</span>
                    {HOURS.map((hour) => {
                        const value = counted.get(`${index + 1}-${hour}`) ?? 0;
                        return (
                            <HintTip
                                key={hour}
                                label={`${weekday} ${padHour(hour)}:00 · ${fmt.n(value)} ${unit}`}
                                enterDelayMs={0}
                                leaveDelayMs={0}
                                autoAlign
                                className='min-w-0 flex-1'
                            >
                                <span className='block aspect-square w-full' style={{ background: heatFill(peak === 0 ? 0 : value / peak) }} />
                            </HintTip>
                        );
                    })}
                </div>
            ))}

            <div className='flex items-center gap-0.5 pl-7'>
                {HOURS.map((hour) => (
                    <span key={hour} className='min-w-0 flex-1 text-center text-[0.5625rem] tabular-nums text-muted'>
                        {HOUR_TICKS.has(hour) ? padHour(hour) : ''}
                    </span>
                ))}
            </div>

            <div className='flex items-center gap-1.5 text-[0.6875rem] text-muted'>
                {copy.chart.quiet}
                {LEGEND_MIXES.map((mix) => (
                    <span key={mix} className='h-1.5 w-3.5' style={{ background: mixFill(mix) }} />
                ))}
                {copy.chart.peak} · {fmt.n(peak)} {unit}/h
            </div>
        </div>
    );
};
