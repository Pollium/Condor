import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from '@/shared/components/Charts';
import { AXIS_TICK, CURSOR_FILL, GRID_STROKE, MARGIN } from '@/shared/utils/chart-style';
import { fmt } from '@/shared/utils/format';

export interface AudienceBucket{
    label: string;
    fresh: number;
    returning: number;
}

const AudienceChart = ({ buckets, className = 'h-56' }: { buckets: AudienceBucket[]; className?: string }) => (
    <div className={className}>
        <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={buckets} margin={MARGIN}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey='label' tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tickFormatter={fmt.k} width={40} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip
                    cursor={{ fill: CURSOR_FILL }}
                    content={({ active, payload }) => {
                        const bucket = active ? (payload?.[0]?.payload as AudienceBucket | undefined) : undefined;
                        if(!bucket) return null;
                        return (
                            <ChartTooltip
                                title={bucket.label}
                                rows={[
                                    { label: 'Sesiones', value: fmt.n(bucket.fresh + bucket.returning), swatch: 'bg-transparent' },
                                    { label: 'Recurrentes', value: fmt.n(bucket.returning), swatch: 'bg-accent' },
                                    { label: 'Nuevas', value: fmt.n(bucket.fresh), swatch: 'bg-fill-strong' }
                                ]}
                            />
                        );
                    }}
                />
                <Bar dataKey='returning' stackId='audience' fill='var(--accent)' maxBarSize={22} isAnimationActive={false} />
                <Bar dataKey='fresh' stackId='audience' fill='var(--fill-strong)' maxBarSize={22} isAnimationActive={false} />
            </ComposedChart>
        </ResponsiveContainer>
    </div>
);

export default AudienceChart;
