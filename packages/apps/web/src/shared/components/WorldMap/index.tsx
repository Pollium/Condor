import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { CELLS, CENTROIDS, GRID, TRACKED, type TrackedCode } from '@/shared/components/WorldMap/world-dots';
import { copy } from '@/shared/i18n';
import { fmt } from '@/shared/utils/format';

const LETTERS = 'abcdefghijklmnopq';
const RADIUS = 0.36;

type Dot = [number, number];

const layout = (() => {
    const land: Dot[] = [];
    const countries = new Map<TrackedCode, Dot[]>();
    for(let i = 0; i < CELLS.length; i++){
        const ch = CELLS[i];
        if(ch === ' ') continue;
        const dot: Dot = [i % GRID.cols, Math.floor(i / GRID.cols)];
        const index = LETTERS.indexOf(ch);
        if(index === -1){
            land.push(dot);
            continue;
        }
        const code = TRACKED[index];
        countries.set(code, [...(countries.get(code) ?? []), dot]);
    }
    return { land, countries };
})();

const isTracked = (code: string): code is TrackedCode => (TRACKED as readonly string[]).includes(code);

interface WorldMapProps{
    data: { code: string; label: string; value: number }[];
    className?: string;
}

interface Hover{
    code: TrackedCode;
    x: number;
    y: number;
}

export const WorldMap = ({ data, className = '' }: WorldMapProps) => {
    const wrapper = useRef<HTMLDivElement>(null);
    const [hover, setHover] = useState<Hover | null>(null);

    const stats = useMemo(() => {
        const total = data.reduce((sum, entry) => sum + entry.value, 0);
        const max = Math.max(1, ...data.map((entry) => entry.value));
        const byCode = new Map(data.filter((entry) => isTracked(entry.code)).map((entry) => [entry.code as TrackedCode, entry]));
        const top = [...byCode.values()].sort((a, b) => b.value - a.value).slice(0, 3);
        return { total, max, byCode, top };
    }, [data]);

    const untracked = useMemo(() => {
        const dots = [...layout.land];
        layout.countries.forEach((cells, code) => {
            if(!stats.byCode.has(code)) dots.push(...cells);
        });
        return (
            <g fill='color-mix(in oklab, var(--foreground) 14%, transparent)'>
                {dots.map(([col, row]) => (
                    <circle key={`${col}-${row}`} cx={col + 0.5} cy={row + 0.5} r={RADIUS} />
                ))}
            </g>
        );
    }, [stats.byCode]);

    const track = (code: TrackedCode) => (event: PointerEvent<SVGGElement>) => {
        const box = wrapper.current?.getBoundingClientRect();
        if(!box) return;
        setHover({ code, x: event.clientX - box.left, y: event.clientY - box.top });
    };

    const hovered = hover ? stats.byCode.get(hover.code) : undefined;

    return (
        <div ref={wrapper} className={`relative ${className}`}>
            <svg viewBox={`0 0 ${GRID.cols} ${GRID.rows}`} width='100%' style={{ height: 'auto', display: 'block' }} role='img' aria-label={copy.worldMap}>
                {untracked}
                {[...stats.byCode.entries()].map(([code, entry]) => {
                    const cells = layout.countries.get(code) ?? [];
                    const mix = hover?.code === code ? 100 : Math.round(35 + 65 * Math.sqrt(entry.value / stats.max));
                    return (
                        <g
                            key={code}
                            fill={`color-mix(in oklab, var(--accent) ${mix}%, transparent)`}
                            onPointerEnter={track(code)}
                            onPointerMove={track(code)}
                            onPointerLeave={() => setHover(null)}
                            className='cursor-default'
                        >
                            {cells.map(([col, row]) => (
                                <rect key={`h${col}-${row}`} x={col} y={row} width={1} height={1} fill='transparent' />
                            ))}
                            {cells.map(([col, row]) => (
                                <circle key={`${col}-${row}`} cx={col + 0.5} cy={row + 0.5} r={RADIUS} />
                            ))}
                        </g>
                    );
                })}
                {stats.top.map((entry) => {
                    const [col, row] = CENTROIDS[entry.code as TrackedCode];
                    return (
                        <g key={`pulse-${entry.code}`} pointerEvents='none'>
                            <circle cx={col + 0.5} cy={row + 0.5} r={0.8} fill='none' stroke='var(--accent)' strokeWidth={0.3}>
                                <animate attributeName='r' values='0.8;3.4' dur='2.4s' repeatCount='indefinite' />
                                <animate attributeName='opacity' values='0.9;0' dur='2.4s' repeatCount='indefinite' />
                            </circle>
                            <circle cx={col + 0.5} cy={row + 0.5} r={0.62} fill='var(--accent)' />
                        </g>
                    );
                })}
            </svg>

            {hover && hovered ? (
                <div
                    className='pointer-events-none absolute z-10 rounded-lg bg-overlay px-3 py-2 text-[12px] shadow-lg backdrop-blur-xl'
                    style={{ left: hover.x + 12, top: hover.y + 12 }}
                >
                    <p className='font-medium text-foreground'>{hovered.label}</p>
                    <p className='tabular-nums text-muted'>
                        {fmt.n(hovered.value)} · {fmt.pct(stats.total ? hovered.value / stats.total : 0)}
                    </p>
                </div>
            ) : null}
        </div>
    );
};
