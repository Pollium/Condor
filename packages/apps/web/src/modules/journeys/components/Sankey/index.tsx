import { Journey } from '@condor/contracts/journeys/domain';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { HEIGHT, layoutSankey, NODE_WIDTH, ribbon, type FlowLink, type FlowNode, type NodeTone } from '@/modules/journeys/utils/sankey-layout';
import { ChartTooltip } from '@/shared/components/Charts';
import { fmt } from '@/shared/utils/format';

const MIN_WIDTH = 860;

const RIBBON = 'color-mix(in oklab, var(--accent) 14%, transparent)';
const RIBBON_ON = 'color-mix(in oklab, var(--accent) 40%, transparent)';
const RIBBON_OFF = 'color-mix(in oklab, var(--accent) 5%, transparent)';
const QUIET = 'color-mix(in oklab, var(--foreground) 6%, transparent)';
const QUIET_ON = 'color-mix(in oklab, var(--foreground) 16%, transparent)';

const FILL: Record<NodeTone, string> = {
    page: 'var(--accent)',
    other: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
    exit: 'color-mix(in oklab, var(--foreground) 25%, transparent)'
};

type Hover = { kind: 'node'; id: string } | { kind: 'link'; index: number } | null;

const columnName = (step: number) => (step === 0 ? 'Entrada' : `Paso ${step + 1}`);

const short = (label: string) => (label.length > 22 ? `${label.slice(0, 21)}…` : label);

const ribbonFill = (link: FlowLink, state: boolean | null) => {
    if(link.target.tone !== 'page') return state ? QUIET_ON : QUIET;
    return state === null ? RIBBON : state ? RIBBON_ON : RIBBON_OFF;
};

const describe = (hover: Hover, nodes: FlowNode[], links: FlowLink[], totals: number[]) => {
    if(hover?.kind === 'node'){
        const node = nodes.find((entry) => entry.id === hover.id);
        if(!node) return null;
        const outgoing = links.filter((link) => link.source === node);
        const onward = outgoing.filter((link) => link.target.tone !== 'exit').reduce((sum, link) => sum + link.value, 0);
        return {
            title: `${node.label} · ${columnName(node.step)}`,
            rows: [
                { label: 'Sesiones', value: fmt.n(node.size), swatch: node.tone === 'page' ? 'bg-accent' : 'bg-foreground/25' },
                { label: 'De la columna', value: fmt.pct(totals[node.step] ? node.size / totals[node.step] : 0), swatch: 'bg-foreground/20' },
                ...(outgoing.length ? [{ label: 'Siguen', value: fmt.pct(node.size ? onward / node.size : 0), swatch: 'bg-foreground/20' }] : [])
            ]
        };
    }
    if(hover?.kind === 'link'){
        const link = links.find((entry) => entry.index === hover.index);
        if(!link) return null;
        return {
            title: `${link.source.label} → ${link.target.label}`,
            rows: [
                { label: 'Sesiones', value: fmt.n(link.value), swatch: 'bg-foreground/30' },
                { label: `De ${short(link.source.label)}`, value: fmt.pct(link.source.size ? link.value / link.source.size : 0), swatch: 'bg-foreground/20' }
            ]
        };
    }
    return null;
};

const Sankey = ({ journey }: { journey: Journey }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(MIN_WIDTH);
    const [hover, setHover] = useState<Hover>(null);
    const [point, setPoint] = useState({ x: 0, y: 0 });

    useLayoutEffect(() => {
        const element = ref.current;
        if(!element) return;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.max(MIN_WIDTH, entry.contentRect.width)));
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const { nodes, links, totals, stride } = useMemo(() => layoutSankey(journey, width), [journey, width]);
    const tooltip = describe(hover, nodes, links, totals);

    const touches = (link: FlowLink) => {
        if(hover === null) return null;
        if(hover.kind === 'link') return hover.index === link.index;
        return link.source.id === hover.id || link.target.id === hover.id;
    };

    return (
        <div ref={ref} className='relative w-full' onMouseLeave={() => setHover(null)}>
            <svg
                width={width}
                height={HEIGHT}
                viewBox={`0 0 ${width} ${HEIGHT}`}
                role='img'
                aria-label='Flujo de sesiones entre páginas'
                onMouseMove={(event) => {
                    const box = event.currentTarget.getBoundingClientRect();
                    setPoint({ x: event.clientX - box.left, y: event.clientY - box.top });
                }}
            >
                {totals.map((total, step) => (
                    <text key={step} x={step * stride} y={14} fontSize={12} fill='var(--muted)'>
                        {columnName(step)} · {fmt.k(total)}
                    </text>
                ))}

                {links.map((link) => (
                    <path
                        key={link.index}
                        d={ribbon(link)}
                        fill={ribbonFill(link, touches(link))}
                        className='transition-[fill] duration-150'
                        onMouseEnter={() => setHover({ kind: 'link', index: link.index })}
                    />
                ))}

                {nodes.map((node) => (
                    <g key={node.id} onMouseEnter={() => setHover({ kind: 'node', id: node.id })} className='cursor-default'>
                        <rect x={node.x - 6} y={node.y - 2} width={NODE_WIDTH + 12} height={node.h + 4} fill='transparent' />
                        <rect
                            x={node.x}
                            y={node.y}
                            width={NODE_WIDTH}
                            height={node.h}
                            fill={FILL[node.tone]}
                            opacity={hover?.kind === 'node' && hover.id !== node.id ? 0.45 : 1}
                        />
                        {node.h >= 4 ? (
                            <text
                                x={node.x + NODE_WIDTH + 8}
                                y={node.y + Math.min(node.h / 2, 12) + 4}
                                fontSize={12}
                                fill={node.tone === 'page' ? 'var(--foreground)' : 'var(--muted)'}
                                stroke='var(--background)'
                                strokeWidth={3}
                                paintOrder='stroke'
                                strokeLinejoin='round'
                            >
                                {short(node.label)}
                                <tspan fill='var(--muted)' dx={6}>{fmt.k(node.size)}</tspan>
                            </text>
                        ) : null}
                    </g>
                ))}
            </svg>

            {tooltip ? (
                <div className='pointer-events-none absolute z-10' style={{ left: Math.min(point.x + 14, width - 220), top: Math.max(0, point.y - 20) }}>
                    <ChartTooltip title={tooltip.title} rows={tooltip.rows} />
                </div>
            ) : null}
        </div>
    );
};

export default Sankey;
