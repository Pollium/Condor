import { Dimension } from '@condor/contracts/overview/domain';
import { Channel, Device, Slice } from '@condor/contracts/shared/analytics';
import { fmt } from '@/shared/utils/format';

interface Named{
    label: string;
    detail?: string;
}

const REGIONS = new Intl.DisplayNames('es', { type: 'region' });
const LANGUAGES = new Intl.DisplayNames('es', { type: 'language' });
const ISO_REGION = /^[A-Z]{2}$/;

const capitalized = (text: string) => text.charAt(0).toLocaleUpperCase('es') + text.slice(1);

const displayed = (names: Intl.DisplayNames, code: string) => {
    try{
        return capitalized(names.of(code) ?? code);
    }catch{
        return code;
    }
};

export const regionOf = (code: string | undefined) => code !== undefined && ISO_REGION.test(code) ? code : undefined;

export const flag = (code: string | undefined) => {
    const region = regionOf(code);
    return region === undefined ? '🌐' : String.fromCodePoint(...[...region].map((char) => 127397 + char.charCodeAt(0)));
};

export const countryName = (code: string) => displayed(REGIONS, code);

export const languageName = (code: string) => displayed(LANGUAGES, code);

export const languageRegion = (code: string) => regionOf(code.split('-')[1]?.toUpperCase());

export const CHANNELS: Record<Channel, Named> = {
    direct: { label: 'Directo', detail: 'Escriben la dirección o usan un marcador' },
    organic: { label: 'Búsqueda orgánica', detail: 'Google, Bing, DuckDuckGo' },
    paid: { label: 'Pago', detail: 'Anuncios y enlaces patrocinados' },
    social: { label: 'Redes sociales', detail: 'Instagram, TikTok, X' },
    messaging: { label: 'Mensajería', detail: 'WhatsApp, Telegram' },
    email: { label: 'Correo', detail: 'Boletines y correos' },
    ai: { label: 'Asistentes IA', detail: 'ChatGPT, Perplexity, Gemini' },
    referral: { label: 'Referencias', detail: 'Enlaces desde otros sitios' }
};

const DEVICES: Record<Device, string> = {
    desktop: 'Escritorio',
    mobile: 'Móvil',
    tablet: 'Tablet'
};

export const FRUSTRATION: Record<string, Named> = {
    rage: { label: 'Clics de rabia', detail: '3+ clics en el mismo punto en menos de 1 s' },
    dead: { label: 'Clics muertos', detail: 'Clic sin cambio en la página ni en la red' },
    error: { label: 'Clics con error', detail: 'Un error JS justo después del clic' },
    uturn: { label: 'Vuelta atrás', detail: 'Vuelve a la página anterior en menos de 7 s' }
};

const DURATIONS: Record<string, string> = {
    '<10s': '< 10 s',
    '10-30s': '10–30 s',
    '30s-1m': '30 s–1 min',
    '1-3m': '1–3 min',
    '3-10m': '3–10 min',
    '10-30m': '10–30 min',
    '>30m': '> 30 min'
};

const CONNECTIONS: Record<string, string> = {
    wifi: 'Wi-Fi',
    ethernet: 'Ethernet',
    cellular: 'Datos móviles',
    'slow-2g': '2G lenta'
};

const range = (id: string) => id.replace('-', '–');

const frequency = (id: string) => {
    if(id === '1') return '1 sesión';
    if(id.endsWith('+')) return `${id.slice(0, -1)} o más`;
    return `${range(id)} sesiones`;
};

const NAMERS: Partial<Record<Dimension, (slice: Slice) => Named>> = {
    country: (slice) => ({ label: countryName(slice.id) }),
    city: (slice) => ({ label: slice.label, detail: slice.detail === undefined ? undefined : countryName(slice.detail) }),
    language: (slice) => ({ label: languageName(slice.id) }),
    device: (slice) => ({ label: DEVICES[slice.id as Device] ?? slice.label }),
    screen: (slice) => ({ label: slice.label.replace('x', ' × ') }),
    connection: (slice) => ({ label: CONNECTIONS[slice.id] ?? slice.label.toUpperCase() }),
    channel: (slice) => CHANNELS[slice.id as Channel] ?? { label: slice.label },
    campaign: (slice) => ({ label: slice.label, detail: slice.detail }),
    release: (slice) => ({
        label: `v${slice.label}`,
        detail: slice.secondary === undefined ? undefined : `${fmt.pct(slice.value ? slice.secondary / slice.value : 0)} con error`
    }),
    frustration: (slice) => FRUSTRATION[slice.id] ?? { label: slice.label },
    duration: (slice) => ({ label: DURATIONS[slice.id] ?? slice.label }),
    depth: (slice) => ({ label: range(slice.id) }),
    frequency: (slice) => ({ label: frequency(slice.id) })
};

export const named = (dimension: Dimension, slice: Slice): Named => NAMERS[dimension]?.(slice) ?? { label: slice.label, detail: slice.detail };
