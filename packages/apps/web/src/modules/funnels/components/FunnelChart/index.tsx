import { FunnelStepResult } from '@condor/contracts/funnels/domain';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from '@/shared/components/Charts';
import { AXIS_TICK, CURSOR_FILL, GRID_STROKE, MARGIN } from '@/shared/utils/chart-style';
import { fmt } from '@/shared/utils/format';

interface Point extends FunnelStepResult{
    index: number;
    cohort: number;
    dropped: number;
}

const short = (text: string, room: number) => (text.length > room ? `${text.slice(0, room - 1)}…` : text);

interface TickProps{
    x?: number;
    y?: number;
    width?: number;
    payload?: { value: number };
    points: Point[];
}

const StepTick = ({ x = 0, y = 0, width = 0, payload, points }: TickProps) => {
    const point = points[payload?.value ?? 0];
    if(!point) return null;
    const slot = width / Math.max(1, points.length);
    const room = Math.max(6, Math.floor(slot / 7));
    const share = fmt.pct(point.fromPrevious);

    return (
        <g transform={`translate(${x},${y})`}>
            <text textAnchor='middle' dy={14} fontSize={12} fill='var(--foreground)'>
                {short(point.label, room)}
            </text>
            <text textAnchor='middle' dy={30} fontSize={12} fill='var(--muted)'>
                {point.index === 0 ? 'Inicio' : slot < 110 ? share : `${share} siguen`}
            </text>
        </g>
    );
};

const FunnelChart = ({ steps }: { steps: FunnelStepResult[] }) => {
    const start = steps[0]?.people ?? 0;
    const points: Point[] = steps.map((step, index) => ({
        ...step,
        index,
        cohort: start,
        dropped: index === 0 ? 0 : steps[index - 1].people - step.people
    }));

    return (
        <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={points} margin={{ ...MARGIN, top: 24 }} barGap={-40}>
                    <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                    <XAxis dataKey='index' tick={<StepTick points={points} />} height={48} interval={0} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tickFormatter={fmt.k} width={40} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip
                        cursor={{ fill: CURSOR_FILL }}
                        content={({ active, payload }) => {
                            const point = active ? (payload?.[0]?.payload as Point | undefined) : undefined;
                            if(!point) return null;
                            return (
                                <ChartTooltip
                                    title={point.label}
                                    rows={[
                                        { label: 'Llegan', value: fmt.n(point.people), swatch: 'bg-accent' },
                                        { label: 'Desde el inicio', value: fmt.pct(point.fromStart), swatch: 'bg-foreground/10' },
                                        ...(point.index === 0 ? [] : [{ label: 'Abandonan', value: fmt.n(point.dropped), swatch: 'bg-foreground/10' }])
                                    ]}
                                />
                            );
                        }}
                    />
                    <Bar dataKey='cohort' barSize={40} fill='var(--foreground)' fillOpacity={0.05} isAnimationActive={false} />
                    <Bar dataKey='people' barSize={40} fill='var(--accent)' isAnimationActive={false}>
                        <LabelList dataKey='people' position='top' formatter={(value) => fmt.k(Number(value))} style={{ fontSize: 12, fill: 'var(--foreground)' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FunnelChart;
