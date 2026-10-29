import { Attribution } from '@/modules/tracking/contracts/domain/queue';
import { Device, VitalName } from '@condor/contracts/shared/analytics';
import { ClickTarget, DemoBug, DemoCity, DemoDevice, DemoProduct, IssueMilestone, PageKind, Weighted } from './types';

export const DEMO_HOST = 'tiendaandes.cl';
export const DEMO_ORIGIN = `https://${DEMO_HOST}`;
export const HISTORY_DAYS = 90;

export const CITIES: Weighted<DemoCity>[] = [
    { weight: 30, value: { city: 'Santiago', region: 'Región Metropolitana', country: 'CL', language: 'es-CL', timezone: 'America/Santiago', utcOffset: -3 } },
    { weight: 5, value: { city: 'Valparaíso', region: 'Valparaíso', country: 'CL', language: 'es-CL', timezone: 'America/Santiago', utcOffset: -3 } },
    { weight: 4, value: { city: 'Concepción', region: 'Biobío', country: 'CL', language: 'es-CL', timezone: 'America/Santiago', utcOffset: -3 } },
    { weight: 2, value: { city: 'Antofagasta', region: 'Antofagasta', country: 'CL', language: 'es-CL', timezone: 'America/Santiago', utcOffset: -3 } },
    { weight: 2, value: { city: 'Temuco', region: 'Araucanía', country: 'CL', language: 'es-CL', timezone: 'America/Santiago', utcOffset: -3 } },
    { weight: 8, value: { city: 'Buenos Aires', region: 'Buenos Aires', country: 'AR', language: 'es-AR', timezone: 'America/Argentina/Buenos_Aires', utcOffset: -3 } },
    { weight: 3, value: { city: 'Córdoba', region: 'Córdoba', country: 'AR', language: 'es-AR', timezone: 'America/Argentina/Cordoba', utcOffset: -3 } },
    { weight: 2, value: { city: 'Rosario', region: 'Santa Fe', country: 'AR', language: 'es-AR', timezone: 'America/Argentina/Cordoba', utcOffset: -3 } },
    { weight: 2, value: { city: 'Mendoza', region: 'Mendoza', country: 'AR', language: 'es-AR', timezone: 'America/Argentina/Mendoza', utcOffset: -3 } },
    { weight: 6, value: { city: 'Lima', region: 'Lima', country: 'PE', language: 'es-PE', timezone: 'America/Lima', utcOffset: -5 } },
    { weight: 1, value: { city: 'Arequipa', region: 'Arequipa', country: 'PE', language: 'es-PE', timezone: 'America/Lima', utcOffset: -5 } },
    { weight: 6, value: { city: 'Ciudad de México', region: 'Ciudad de México', country: 'MX', language: 'es-MX', timezone: 'America/Mexico_City', utcOffset: -6 } },
    { weight: 2, value: { city: 'Guadalajara', region: 'Jalisco', country: 'MX', language: 'es-MX', timezone: 'America/Mexico_City', utcOffset: -6 } },
    { weight: 2, value: { city: 'Monterrey', region: 'Nuevo León', country: 'MX', language: 'es-MX', timezone: 'America/Monterrey', utcOffset: -6 } },
    { weight: 5, value: { city: 'Bogotá', region: 'Bogotá D.C.', country: 'CO', language: 'es-CO', timezone: 'America/Bogota', utcOffset: -5 } },
    { weight: 2, value: { city: 'Medellín', region: 'Antioquia', country: 'CO', language: 'es-CO', timezone: 'America/Bogota', utcOffset: -5 } },
    { weight: 2, value: { city: 'Montevideo', region: 'Montevideo', country: 'UY', language: 'es-UY', timezone: 'America/Montevideo', utcOffset: -3 } },
    { weight: 1, value: { city: 'Quito', region: 'Pichincha', country: 'EC', language: 'es-EC', timezone: 'America/Guayaquil', utcOffset: -5 } },
    { weight: 5, value: { city: 'Madrid', region: 'Comunidad de Madrid', country: 'ES', language: 'es-ES', timezone: 'Europe/Madrid', utcOffset: 1 } },
    { weight: 3, value: { city: 'Barcelona', region: 'Cataluña', country: 'ES', language: 'es-ES', timezone: 'Europe/Madrid', utcOffset: 1 } },
    { weight: 1, value: { city: 'Valencia', region: 'Comunidad Valenciana', country: 'ES', language: 'es-ES', timezone: 'Europe/Madrid', utcOffset: 1 } },
    { weight: 1, value: { city: 'Sevilla', region: 'Andalucía', country: 'ES', language: 'es-ES', timezone: 'Europe/Madrid', utcOffset: 1 } }
];

export const DEVICES: Weighted<DemoDevice>[] = [
    { weight: 26, value: { device: 'mobile', os: 'iOS', osVersion: '18.1', browser: 'Safari', browserVersion: '18.1', screenWidth: 390, screenHeight: 844, viewportWidth: 390 } },
    { weight: 6, value: { device: 'mobile', os: 'iOS', osVersion: '17.6', browser: 'Safari', browserVersion: '17.6', screenWidth: 375, screenHeight: 812, viewportWidth: 375 } },
    { weight: 18, value: { device: 'mobile', os: 'Android', osVersion: '14', browser: 'Chrome', browserVersion: '130.0', screenWidth: 412, screenHeight: 915, viewportWidth: 412 } },
    { weight: 8, value: { device: 'mobile', os: 'Android', osVersion: '13', browser: 'Samsung Internet', browserVersion: '26.0', screenWidth: 360, screenHeight: 800, viewportWidth: 360 } },
    { weight: 12, value: { device: 'desktop', os: 'Windows', osVersion: '11', browser: 'Chrome', browserVersion: '130.0', screenWidth: 1920, screenHeight: 1080, viewportWidth: 1903 } },
    { weight: 5, value: { device: 'desktop', os: 'Windows', osVersion: '10', browser: 'Edge', browserVersion: '130.0', screenWidth: 1536, screenHeight: 864, viewportWidth: 1519 } },
    { weight: 3, value: { device: 'desktop', os: 'Windows', osVersion: '11', browser: 'Firefox', browserVersion: '131.0', screenWidth: 1920, screenHeight: 1080, viewportWidth: 1903 } },
    { weight: 8, value: { device: 'desktop', os: 'macOS', osVersion: '15.0', browser: 'Safari', browserVersion: '18.0', screenWidth: 1440, screenHeight: 900, viewportWidth: 1440 } },
    { weight: 6, value: { device: 'desktop', os: 'macOS', osVersion: '14.6', browser: 'Chrome', browserVersion: '130.0', screenWidth: 2560, screenHeight: 1440, viewportWidth: 2545 } },
    { weight: 2, value: { device: 'desktop', os: 'Linux', osVersion: '', browser: 'Firefox', browserVersion: '131.0', screenWidth: 1920, screenHeight: 1080, viewportWidth: 1905 } },
    { weight: 4, value: { device: 'tablet', os: 'iPadOS', osVersion: '18.1', browser: 'Safari', browserVersion: '18.1', screenWidth: 820, screenHeight: 1180, viewportWidth: 820 } },
    { weight: 2, value: { device: 'tablet', os: 'Android', osVersion: '14', browser: 'Chrome', browserVersion: '130.0', screenWidth: 800, screenHeight: 1280, viewportWidth: 800 } }
];

export const PRODUCTS: Weighted<DemoProduct>[] = [
    { weight: 12, value: { slug: 'poncho-alpaca', name: 'Poncho de alpaca', price: 89990 } },
    { weight: 9, value: { slug: 'chaleco-lana', name: 'Chaleco de lana', price: 54990 } },
    { weight: 10, value: { slug: 'gorro-andino', name: 'Gorro andino', price: 14990 } },
    { weight: 4, value: { slug: 'bufanda-vicuna', name: 'Bufanda de vicuña', price: 119990 } },
    { weight: 8, value: { slug: 'mochila-trekking', name: 'Mochila de trekking 40L', price: 69990 } },
    { weight: 7, value: { slug: 'botas-montana', name: 'Botas de montaña', price: 99990 } },
    { weight: 8, value: { slug: 'termo-acero', name: 'Termo de acero 1L', price: 24990 } },
    { weight: 7, value: { slug: 'chaqueta-cortaviento', name: 'Chaqueta cortaviento', price: 79990 } },
    { weight: 6, value: { slug: 'guantes-polar', name: 'Guantes polares', price: 12990 } },
    { weight: 6, value: { slug: 'calcetines-merino', name: 'Calcetines de merino', price: 9990 } },
    { weight: 3, value: { slug: 'manta-telar', name: 'Manta de telar', price: 64990 } },
    { weight: 6, value: { slug: 'polera-algodon', name: 'Polera de algodón orgánico', price: 19990 } }
];

const attribution = (overrides: Partial<Attribution>): Attribution => {
    return {
        channel: 'direct',
        source: null,
        referrer: null,
        referrerHost: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmContent: null,
        utmTerm: null,
        ...overrides
    };
};

export const DIRECT = attribution({});

export const CAMPAIGN = attribution({ channel: 'paid', source: 'google', referrer: 'https://www.google.com/', referrerHost: 'www.google.com', utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'cyber-andes' });

export const ATTRIBUTIONS: Weighted<Attribution>[] = [
    { weight: 26, value: DIRECT },
    { weight: 22, value: attribution({ channel: 'organic', source: 'google', referrer: 'https://www.google.com/', referrerHost: 'www.google.com' }) },
    { weight: 3, value: attribution({ channel: 'organic', source: 'bing', referrer: 'https://www.bing.com/', referrerHost: 'www.bing.com' }) },
    { weight: 2, value: attribution({ channel: 'organic', source: 'duckduckgo', referrer: 'https://duckduckgo.com/', referrerHost: 'duckduckgo.com' }) },
    { weight: 8, value: attribution({ channel: 'paid', source: 'google', referrer: 'https://www.google.com/', referrerHost: 'www.google.com', utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'temporada-invierno' }) },
    { weight: 5, value: attribution({ channel: 'paid', source: 'instagram', referrer: 'https://l.instagram.com/', referrerHost: 'l.instagram.com', utmSource: 'instagram', utmMedium: 'paid-social', utmCampaign: 'envio-gratis' }) },
    { weight: 6, value: attribution({ channel: 'social', source: 'instagram', referrer: 'https://l.instagram.com/', referrerHost: 'l.instagram.com' }) },
    { weight: 4, value: attribution({ channel: 'social', source: 'facebook', referrer: 'https://l.facebook.com/', referrerHost: 'l.facebook.com' }) },
    { weight: 3, value: attribution({ channel: 'social', source: 'tiktok', referrer: 'https://www.tiktok.com/', referrerHost: 'www.tiktok.com' }) },
    { weight: 6, value: attribution({ channel: 'messaging', source: 'whatsapp' }) },
    { weight: 5, value: attribution({ channel: 'email', source: 'newsletter', utmSource: 'newsletter', utmMedium: 'email', utmCampaign: 'novedades-semana' }) },
    { weight: 2, value: attribution({ channel: 'ai', source: 'chatgpt', referrer: 'https://chatgpt.com/', referrerHost: 'chatgpt.com', utmSource: 'chatgpt.com' }) },
    { weight: 1, value: attribution({ channel: 'ai', source: 'perplexity', referrer: 'https://www.perplexity.ai/', referrerHost: 'www.perplexity.ai' }) },
    { weight: 3, value: attribution({ channel: 'referral', source: 'viajeroandino.cl', referrer: 'https://viajeroandino.cl/guia-invierno', referrerHost: 'viajeroandino.cl' }) }
];

export const LANDINGS: Record<Attribution['channel'], Weighted<PageKind>[]> = {
    direct: [{ value: 'home', weight: 7 }, { value: 'account', weight: 1 }, { value: 'product', weight: 2 }],
    organic: [{ value: 'product', weight: 6 }, { value: 'home', weight: 3 }, { value: 'catalog', weight: 1 }],
    paid: [{ value: 'offers', weight: 5 }, { value: 'product', weight: 5 }],
    social: [{ value: 'product', weight: 5 }, { value: 'offers', weight: 3 }, { value: 'home', weight: 2 }],
    messaging: [{ value: 'product', weight: 7 }, { value: 'offers', weight: 3 }],
    email: [{ value: 'offers', weight: 8 }, { value: 'product', weight: 2 }],
    ai: [{ value: 'product', weight: 8 }, { value: 'home', weight: 2 }],
    referral: [{ value: 'product', weight: 6 }, { value: 'home', weight: 4 }]
};

export const FLOW: Record<PageKind, Weighted<PageKind | null>[]> = {
    home: [{ value: 'catalog', weight: 40 }, { value: 'product', weight: 30 }, { value: 'offers', weight: 15 }, { value: 'account', weight: 4 }, { value: null, weight: 14 }],
    catalog: [{ value: 'product', weight: 65 }, { value: 'offers', weight: 10 }, { value: 'home', weight: 5 }, { value: null, weight: 20 }],
    product: [{ value: 'cart', weight: 11 }, { value: 'product', weight: 32 }, { value: 'catalog', weight: 16 }, { value: null, weight: 36 }],
    cart: [{ value: 'checkout', weight: 55 }, { value: 'product', weight: 15 }, { value: null, weight: 30 }],
    checkout: [{ value: 'account', weight: 10 }, { value: null, weight: 90 }],
    offers: [{ value: 'product', weight: 60 }, { value: 'catalog', weight: 15 }, { value: null, weight: 25 }],
    account: [{ value: 'home', weight: 25 }, { value: 'catalog', weight: 20 }, { value: null, weight: 55 }]
};

export const PAGE_TITLES: Record<PageKind, string> = {
    home: 'Tienda Andes — Ropa y equipo de montaña',
    catalog: 'Productos · Tienda Andes',
    product: '· Tienda Andes',
    cart: 'Carrito · Tienda Andes',
    checkout: 'Pago · Tienda Andes',
    offers: 'Ofertas · Tienda Andes',
    account: 'Mi cuenta · Tienda Andes'
};

export const PAGE_PATHS: Record<PageKind, string> = {
    home: '/',
    catalog: '/productos',
    product: '/productos/:slug',
    cart: '/carrito',
    checkout: '/checkout',
    offers: '/ofertas',
    account: '/cuenta'
};

export const PAGE_HEIGHTS: Record<PageKind, [number, number]> = {
    home: [3200, 5200],
    catalog: [2800, 6000],
    product: [2400, 4200],
    cart: [1400, 2200],
    checkout: [1800, 2900],
    offers: [3000, 6400],
    account: [1200, 1800]
};

export const DWELL_SECONDS: Record<PageKind, [number, number]> = {
    home: [6, 50],
    catalog: [10, 70],
    product: [15, 140],
    cart: [10, 60],
    checkout: [40, 240],
    offers: [10, 80],
    account: [8, 60]
};

const target = (selector: string, text: string, desktop: [number, number], mobile: [number, number], rage = 0, dead = 0): ClickTarget => {
    return { selector, text, desktop, mobile, rage, dead };
};

const NAV = '#app > header.bar > nav';
const CARD = (n: number) => `#app > main.page > div.grid > a.card:nth-of-type(${n})`;

export const CLICK_TARGETS: Record<PageKind, ClickTarget[]> = {
    home: [
        target('#app > main.page > section.hero > a.button', 'Ver productos', [0.07, 230], [0.15, 300]),
        target(CARD(1), 'Chaqueta Cumbre $89.990', [0.24, 560], [0.5, 640]),
        target(CARD(2), 'Mochila Ruta 30 L $54.990', [0.42, 560], [0.5, 980]),
        target(`${NAV} > a:nth-of-type(2)`, 'Ofertas', [0.86, 27], [0.33, 64])
    ],
    catalog: [
        target(CARD(1), 'Chaqueta Cumbre $89.990', [0.24, 298], [0.5, 380]),
        target(CARD(3), 'Botas de montaña $119.990', [0.58, 298], [0.5, 1050]),
        target(CARD(5), 'Gorro de lana merino $17.990', [0.22, 573], [0.5, 1720]),
        target(`${NAV} > a:nth-of-type(1)`, 'Productos', [0.8, 27], [0.13, 64])
    ],
    product: [
        target('main.page > article.product > div > div.actions > button.button', 'Añadir al carrito', [0.55, 412], [0.26, 821]),
        target('#app > main.page > article.product > div > span.more', 'Ver más detalles', [0.55, 336], [0.2, 761], 0, 0.9),
        target(`${NAV} > a:nth-of-type(1)`, 'Productos', [0.8, 27], [0.13, 64]),
        target(`${NAV} > a.cart:nth-of-type(4)`, 'Carrito (1)', [0.95, 27], [0.73, 64])
    ],
    cart: [
        target('#app > main.page > a.button', 'Ir a pagar', [0.2, 423], [0.2, 424]),
        target('#app > main.page > div.coupon > button.ghost', 'Aplicar cupón', [0.81, 297], [0.83, 289]),
        target(`${NAV} > a:nth-of-type(1)`, 'Productos', [0.8, 27], [0.13, 64])
    ],
    checkout: [
        target('#pay', 'Pagar', [0.31, 449], [0.5, 462], 0.45),
        target('#app > main.page > form.form > label:nth-of-type(1)', 'Nombre en la tarjeta', [0.2, 170], [0.3, 200])
    ],
    offers: [
        target(CARD(1), 'Chaqueta Cumbre $89.990', [0.24, 340], [0.5, 420]),
        target(CARD(2), 'Botas de montaña $119.990', [0.42, 340], [0.5, 1080])
    ],
    account: [
        target('#app > main.page > form.form > button.button', 'Entrar', [0.16, 372], [0.5, 372]),
        target(`${NAV} > a:nth-of-type(3)`, 'Cuenta', [0.9, 27], [0.53, 64])
    ]
};

export const RELEASES: Array<[number, string]> = [
    [0, '2.3.0'],
    [30, '2.4.0'],
    [65, '2.5.0'],
    [82, '2.5.1']
];

const DEPLOY_DAYS = new Set(RELEASES.flatMap(([day]) => [day, day + 1]));

export const BUGS: DemoBug[] = [
    {
        page: 'cart',
        errorType: 'TypeError',
        messages: ["Cannot read properties of undefined (reading 'price')"],
        frame: `at cartTotal (${DEMO_ORIGIN}/assets/cart-3f9a1c.js:212:31)`,
        probability: 0.3,
        occurs: (visit) => visit.release === '2.4.0'
    },
    {
        page: 'checkout',
        errorType: 'TypeError',
        messages: ['Failed to fetch'],
        frame: `at submitPayment (${DEMO_ORIGIN}/assets/checkout-8b2e41.js:88:17)`,
        probability: 0.05,
        occurs: () => true
    },
    {
        page: 'product',
        errorType: 'TypeError',
        messages: ['ProductGallery-a1b2c3', 'ProductGallery-77e0d1', 'ProductGallery-c90f4a'].map((chunk) => `Failed to fetch dynamically imported module: ${DEMO_ORIGIN}/assets/${chunk}.js`),
        frame: `at loadGallery (${DEMO_ORIGIN}/assets/product-5d2c9e.js:14:9)`,
        probability: 0.06,
        occurs: (visit) => DEPLOY_DAYS.has(visit.day)
    },
    {
        page: 'account',
        errorType: 'RangeError',
        messages: ['Invalid time value'],
        frame: `at formatOrderDate (${DEMO_ORIGIN}/assets/account-77d0e2.js:54:12)`,
        probability: 0.4,
        occurs: (visit) => visit.visitor.device.browser === 'Safari' && (visit.day < 50 || visit.day >= 82)
    },
    {
        page: 'home',
        errorType: 'ReferenceError',
        messages: ['gtag is not defined'],
        frame: `at trackPromo (${DEMO_ORIGIN}/assets/home-19c4aa.js:33:5)`,
        probability: 0.03,
        occurs: () => true
    }
];

export const MILESTONES: IssueMilestone[] = [
    { day: 40, message: 'gtag is not defined', status: 'ignored' },
    { day: 50, message: 'Invalid time value', status: 'resolved' },
    { day: 66, message: "Cannot read properties of undefined (reading 'price')", status: 'resolved' }
];

export const FIRST_NAMES = ['Camila', 'Valentina', 'Sofía', 'Martina', 'Isidora', 'Antonia', 'Florencia', 'Catalina', 'Fernanda', 'Javiera', 'Benjamín', 'Matías', 'Vicente', 'Martín', 'Joaquín', 'Tomás', 'Agustín', 'Lucas', 'Diego', 'Sebastián', 'Lucía', 'Paula', 'Daniela', 'Andrés', 'Felipe', 'Mateo', 'Gabriela', 'Renata', 'Emilia', 'Ignacio'];

export const LAST_NAMES = ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'García', 'Torres', 'Castillo', 'Ramírez', 'Flores', 'Vargas', 'Reyes', 'Navarro', 'Romero'];

export const LOCAL_HOUR_WEIGHTS = [2, 1, 1, 1, 1, 1, 2, 4, 6, 8, 9, 10, 12, 13, 11, 10, 10, 11, 12, 14, 16, 17, 14, 8];

export const WEEKDAY_WEIGHTS = [0.8, 1.05, 1.0, 1.0, 1.0, 0.95, 0.75];

export const VITAL_THRESHOLDS: Record<VitalName, [number, number]> = {
    LCP: [2500, 4000],
    INP: [200, 500],
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    TTFB: [800, 1800]
};

export const VITAL_RANGES: Record<Exclude<VitalName, 'FCP'>, [number, number]> = {
    TTFB: [120, 650],
    LCP: [900, 2700],
    INP: [40, 260],
    CLS: [0, 0.09]
};

export const FCP_SHARE_OF_LCP: [number, number] = [0.45, 0.7];

export const LAYOUT_SHIFT_CHANCE = 0.15;

export const LAYOUT_SHIFT_RANGE: [number, number] = [0.1, 0.35];

export const DEVICE_SLOWDOWN: Record<Device, number> = {
    mobile: 1.45,
    tablet: 1.2,
    desktop: 1
};

export const FASTER_RELEASES = new Set(['2.5.0', '2.5.1']);

export const FASTER_RELEASE_SPEEDUP = 0.85;

export const ACTIVE_SHARE: [number, number] = [0.45, 0.9];

export const SCROLL_FLOOR: Record<PageKind, number> = {
    home: 0.15,
    catalog: 0.15,
    product: 0.4,
    cart: 0.3,
    checkout: 0.3,
    offers: 0.15,
    account: 0.2
};
