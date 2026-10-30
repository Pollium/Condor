import { SessionEvent } from '@condor/contracts/sessions/domain';
import { copy } from '@/modules/sessions/i18n';
import { intlLocale } from '@/shared/i18n/locale';

export interface Described{
    title: string;
    detail: string | null;
    danger: boolean;
}

const RATINGS: Record<string, string> = {
    good: copy.timeline.ratings.good,
    'needs-improvement': copy.timeline.ratings.needsImprovement,
    poor: copy.timeline.ratings.poor
};

const shift = new Intl.NumberFormat(intlLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const value = (entry: unknown): string => (typeof entry === 'object' && entry !== null ? JSON.stringify(entry) : String(entry));

const label = (entry: unknown): string | null => (typeof entry === 'string' && entry ? entry : null);

const props = (entry: SessionEvent): string | null => {
    const pairs = Object.entries(entry.props ?? {}).filter(([, item]) => item !== null && item !== undefined);
    return pairs.length ? pairs.map(([key, item]) => `${key}: ${value(item)}`).join(' · ') : null;
};

const vital = (entry: SessionEvent): string => {
    if(entry.value === null) return entry.name ?? copy.timeline.metric;
    const amount = entry.name === 'CLS' ? shift.format(entry.value) : `${Math.round(entry.value)} ms`;
    return `${entry.name ?? copy.timeline.metric} ${amount}`;
};

export const TIMELINE_TYPES = new Set(['pageview', 'click', 'custom', 'error', 'vital', 'identify']);

export const describe = (entry: SessionEvent): Described => {
    switch(entry.type){
        case 'pageview':
            return { title: copy.timeline.opens(entry.path), detail: entry.title, danger: false };
        case 'click': {
            const kind = entry.rage ? copy.timeline.rageClick : entry.dead ? copy.timeline.deadClick : copy.timeline.click;
            return {
                title: entry.text ? copy.timeline.clickOn(kind, entry.text) : kind,
                detail: entry.selector,
                danger: entry.rage
            };
        }
        case 'error':
            return { title: entry.text ?? copy.timeline.error, detail: [label(entry.props?.errorType), label(entry.props?.source), entry.path].filter(Boolean).join(' · '), danger: true };
        case 'vital': {
            const rating = typeof entry.props?.rating === 'string' ? RATINGS[entry.props.rating] : undefined;
            return { title: vital(entry), detail: [rating, entry.path].filter(Boolean).join(' · '), danger: false };
        }
        case 'identify':
            return { title: copy.timeline.identifies, detail: props(entry), danger: false };
        default:
            return { title: entry.name ?? copy.timeline.event, detail: props(entry), danger: false };
    }
};

export const pageAt = (timeline: SessionEvent[], offset: number | null): string | null =>
    timeline.reduce<string | null>((path, entry) => (entry.type === 'pageview' && (offset === null || entry.offsetMs <= offset) ? entry.path : path), null);
