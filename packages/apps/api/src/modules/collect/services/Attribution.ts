import { Attribution } from '@/modules/tracking/contracts/domain/queue';
import { WireUtm } from '@condor/contracts/ingest/wire';
import { Channel } from '@condor/contracts/shared/analytics';

export interface AttributionInput{
    referrer?: string;
    utm?: WireUtm;
    projectHost: string;
    pageHost: string | null;
}

interface KnownSource{
    label: string;
    channel: Channel;
    names: string[];
}

const PAID_MEDIUMS = new Set(['cpc', 'ppc', 'paid', 'ads', 'display']);
const EMAIL_MEDIUMS = new Set(['email', 'newsletter']);
const WWW_PREFIX = 'www.';

const KNOWN_SOURCES: KnownSource[] = [
    { label: 'ChatGPT', channel: 'ai', names: ['chatgpt', 'openai'] },
    { label: 'Perplexity', channel: 'ai', names: ['perplexity'] },
    { label: 'Gemini', channel: 'ai', names: ['gemini', 'gemini.google.com', 'bard.google.com'] },
    { label: 'Claude', channel: 'ai', names: ['claude.ai'] },
    { label: 'Copilot', channel: 'ai', names: ['copilot'] },
    { label: 'Google', channel: 'organic', names: ['google'] },
    { label: 'Bing', channel: 'organic', names: ['bing'] },
    { label: 'DuckDuckGo', channel: 'organic', names: ['duckduckgo'] },
    { label: 'Yahoo', channel: 'organic', names: ['yahoo'] },
    { label: 'Yandex', channel: 'organic', names: ['yandex'] },
    { label: 'Baidu', channel: 'organic', names: ['baidu'] },
    { label: 'Ecosia', channel: 'organic', names: ['ecosia'] },
    { label: 'Brave Search', channel: 'organic', names: ['search.brave.com'] },
    { label: 'Facebook', channel: 'social', names: ['facebook', 'fb.com', 'fb.me'] },
    { label: 'Instagram', channel: 'social', names: ['instagram'] },
    { label: 'X', channel: 'social', names: ['t.co', 'twitter', 'x.com'] },
    { label: 'LinkedIn', channel: 'social', names: ['linkedin', 'lnkd.in'] },
    { label: 'TikTok', channel: 'social', names: ['tiktok'] },
    { label: 'Reddit', channel: 'social', names: ['reddit'] },
    { label: 'YouTube', channel: 'social', names: ['youtube', 'youtu.be'] },
    { label: 'Pinterest', channel: 'social', names: ['pinterest'] },
    { label: 'Threads', channel: 'social', names: ['threads.net', 'threads.com'] },
    { label: 'WhatsApp', channel: 'messaging', names: ['whatsapp', 'wa.me'] },
    { label: 'Telegram', channel: 'messaging', names: ['telegram', 't.me'] },
    { label: 'Messenger', channel: 'messaging', names: ['messenger'] },
    { label: 'Discord', channel: 'messaging', names: ['discord'] },
    { label: 'Slack', channel: 'messaging', names: ['slack'] }
];

const cleaned = (value: string | undefined): string | null => {
    const trimmed = value?.trim();
    return trimmed === undefined || trimmed === '' ? null : trimmed;
};

const parsedHost = (value: string): string | null => {
    try{
        return new URL(value).hostname || null;
    }catch{
        return null;
    }
};

export const hostOf = (value: string | undefined): string | null => {
    const trimmed = cleaned(value);
    if(trimmed === null) return null;

    const host = (parsedHost(trimmed) ?? parsedHost(`https://${trimmed}`))?.toLowerCase() ?? null;
    if(host === null) return null;

    return host.startsWith(WWW_PREFIX) ? host.slice(WWW_PREFIX.length) : host;
};

const matchesName = (host: string, name: string): boolean => {
    if(name.includes('.')) return host === name || host.endsWith(`.${name}`);
    return host.split('.').includes(name);
};

const knownSource = (host: string): KnownSource | undefined =>
    KNOWN_SOURCES.find((source) => source.names.some((name) => matchesName(host, name)));

const channelOf = (medium: string | null, known: KnownSource | undefined): Channel => {
    const normalized = medium?.toLowerCase() ?? '';
    if(PAID_MEDIUMS.has(normalized)) return 'paid';
    if(EMAIL_MEDIUMS.has(normalized)) return 'email';
    return known?.channel ?? 'referral';
};

export const attribute = ({ referrer, utm = {}, projectHost, pageHost }: AttributionInput): Attribution | undefined => {
    const referrerHost = hostOf(referrer);
    const external = referrerHost !== null && referrerHost !== hostOf(projectHost) && referrerHost !== pageHost;
    const utmSource = cleaned(utm.source);
    const utmMedium = cleaned(utm.medium);
    const utmCampaign = cleaned(utm.campaign);
    const utmContent = cleaned(utm.content);
    const utmTerm = cleaned(utm.term);
    const tagged = [utmSource, utmMedium, utmCampaign, utmContent, utmTerm].some((value) => value !== null);

    if(!external && !tagged) return undefined;

    const fromUtm = utmSource === null ? undefined : knownSource(utmSource.toLowerCase());
    const fromReferrer = external ? knownSource(referrerHost) : undefined;

    return {
        channel: channelOf(utmMedium, fromUtm ?? fromReferrer),
        source: fromUtm?.label ?? utmSource ?? fromReferrer?.label ?? (external ? referrerHost : null),
        referrer: external ? cleaned(referrer) : null,
        referrerHost: external ? referrerHost : null,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm
    };
};
