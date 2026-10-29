import { SessionEvent } from '@condor/contracts/sessions/domain';

export interface Described{
    title: string;
    detail: string | null;
    danger: boolean;
}

const RATINGS: Record<string, string> = { good: 'bueno', 'needs-improvement': 'mejorable', poor: 'lento' };

const value = (entry: unknown): string => (typeof entry === 'object' && entry !== null ? JSON.stringify(entry) : String(entry));

const label = (entry: unknown): string | null => (typeof entry === 'string' && entry ? entry : null);

const props = (entry: SessionEvent): string | null => {
    const pairs = Object.entries(entry.props ?? {}).filter(([, item]) => item !== null && item !== undefined);
    return pairs.length ? pairs.map(([key, item]) => `${key}: ${value(item)}`).join(' · ') : null;
};

const vital = (entry: SessionEvent): string => {
    if(entry.value === null) return entry.name ?? 'Métrica';
    const amount = entry.name === 'CLS' ? entry.value.toFixed(2).replace('.', ',') : `${Math.round(entry.value)} ms`;
    return `${entry.name ?? 'Métrica'} ${amount}`;
};

export const TIMELINE_TYPES = new Set(['pageview', 'click', 'custom', 'error', 'vital', 'identify']);

export const describe = (entry: SessionEvent): Described => {
    switch(entry.type){
        case 'pageview':
            return { title: `Abre ${entry.path}`, detail: entry.title, danger: false };
        case 'click': {
            const kind = entry.rage ? 'Clic de rabia' : entry.dead ? 'Clic muerto' : 'Clic';
            return {
                title: entry.text ? `${kind} en «${entry.text}»` : kind,
                detail: entry.selector,
                danger: entry.rage
            };
        }
        case 'error':
            return { title: entry.text ?? 'Error', detail: [label(entry.props?.errorType), label(entry.props?.source), entry.path].filter(Boolean).join(' · '), danger: true };
        case 'vital': {
            const rating = typeof entry.props?.rating === 'string' ? RATINGS[entry.props.rating] : undefined;
            return { title: vital(entry), detail: [rating ? `Resultado ${rating}` : null, entry.path].filter(Boolean).join(' · '), danger: false };
        }
        case 'identify':
            return { title: 'Se identifica', detail: props(entry), danger: false };
        default:
            return { title: entry.name ?? 'Evento', detail: props(entry), danger: false };
    }
};

export const pageAt = (timeline: SessionEvent[], offset: number | null): string | null =>
    timeline.reduce<string | null>((path, entry) => (entry.type === 'pageview' && (offset === null || entry.offsetMs <= offset) ? entry.path : path), null);
