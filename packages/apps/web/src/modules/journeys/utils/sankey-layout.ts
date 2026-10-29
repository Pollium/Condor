import { Journey, JOURNEY_EXIT, JOURNEY_OTHER } from '@condor/contracts/journeys/domain';

export const HEIGHT = 440;
export const TOP = 34;
export const NODE_WIDTH = 6;
export const LABEL_SPACE = 160;
const GAP = 14;

export type NodeTone = 'page' | 'other' | 'exit';

export interface FlowNode{
    id: string;
    step: number;
    label: string;
    tone: NodeTone;
    size: number;
    x: number;
    y: number;
    h: number;
}

export interface FlowLink{
    index: number;
    source: FlowNode;
    target: FlowNode;
    value: number;
    sy: number;
    ty: number;
    h: number;
}

const toneOf = (path: string): NodeTone => (path === JOURNEY_EXIT ? 'exit' : path === JOURNEY_OTHER ? 'other' : 'page');

const RANK: Record<NodeTone, number> = { page: 0, other: 1, exit: 2 };

export const nodeLabel = (path: string) => (path === JOURNEY_EXIT ? 'Salida' : path === JOURNEY_OTHER ? 'Otras páginas' : path);

export const columnStride = (width: number, steps: number) => (width - LABEL_SPACE - NODE_WIDTH) / Math.max(1, steps - 1);

export const layoutSankey = (journey: Journey, width: number) => {
    const inner = HEIGHT - TOP;
    const columns = Array.from({ length: journey.steps }, (_, index) =>
        journey.nodes
            .filter((node) => node.step === index + 1)
            .sort((a, b) => RANK[toneOf(a.path)] - RANK[toneOf(b.path)] || b.sessions - a.sessions)
    ).filter((column) => column.length > 0);
    const totals = columns.map((column) => column.reduce((sum, node) => sum + node.sessions, 0));
    const scale = Math.min(...columns.map((column, index) => (inner - GAP * (column.length - 1)) / Math.max(1, totals[index])));
    const stride = columnStride(width, columns.length);

    const nodes = new Map<string, FlowNode>();
    columns.forEach((column, index) => {
        const used = column.reduce((sum, node) => sum + Math.max(2, node.sessions * scale), 0) + GAP * (column.length - 1);
        let y = TOP + (inner - used) / 2;
        column.forEach((node) => {
            const h = Math.max(2, node.sessions * scale);
            nodes.set(node.id, { id: node.id, step: index, label: nodeLabel(node.path), tone: toneOf(node.path), size: node.sessions, x: index * stride, y, h });
            y += h + GAP;
        });
    });

    const links: FlowLink[] = journey.links.flatMap((link, index) => {
        const source = nodes.get(link.source);
        const target = nodes.get(link.target);
        return source && target && link.sessions > 0 ? [{ index, source, target, value: link.sessions, sy: 0, ty: 0, h: link.sessions * scale }] : [];
    });

    nodes.forEach((node) => {
        let out = node.y;
        links.filter((link) => link.source === node).sort((a, b) => a.target.y - b.target.y).forEach((link) => {
            link.sy = out;
            out += link.h;
        });
        let into = node.y;
        links.filter((link) => link.target === node).sort((a, b) => a.source.y - b.source.y).forEach((link) => {
            link.ty = into;
            into += link.h;
        });
    });

    return { nodes: [...nodes.values()], links, totals, stride };
};

export const ribbon = (link: FlowLink) => {
    const x0 = link.source.x + NODE_WIDTH;
    const x1 = link.target.x;
    const mid = (x0 + x1) / 2;
    return `M${x0},${link.sy}C${mid},${link.sy} ${mid},${link.ty} ${x1},${link.ty}L${x1},${link.ty + link.h}C${mid},${link.ty + link.h} ${mid},${link.sy + link.h} ${x0},${link.sy + link.h}Z`;
};
