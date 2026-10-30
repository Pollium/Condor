import { fmt } from '@/shared/utils/format';

export default {
    kpis: {
        sessions: 'Sesiones',
        people: 'Personas',
        duration: 'Duración media',
        bounce: 'Rebote',
        frustrated: 'Sesiones frustradas',
        errors: 'Errores JS'
    },
    periods: {
        '24h': 'últimas 24 horas',
        '7d': 'últimos 7 días',
        '30d': 'últimos 30 días',
        '90d': 'últimos 90 días'
    },
    noPrevious: 'Sin periodo anterior',
    noData: 'Sin datos en este periodo.',
    loaded: {
        failed: 'No se pudo cargar.',
        retry: 'Reintentar'
    },
    channels: {
        direct: { label: 'Directo', detail: 'Escriben la dirección o usan un marcador' },
        organic: { label: 'Búsqueda orgánica', detail: 'Google, Bing, DuckDuckGo' },
        paid: { label: 'Pago', detail: 'Anuncios y enlaces patrocinados' },
        social: { label: 'Redes sociales', detail: 'Instagram, TikTok, X' },
        messaging: { label: 'Mensajería', detail: 'WhatsApp, Telegram' },
        email: { label: 'Correo', detail: 'Boletines y correos' },
        ai: { label: 'Asistentes IA', detail: 'ChatGPT, Perplexity, Gemini' },
        referral: { label: 'Referencias', detail: 'Enlaces desde otros sitios' }
    },
    devices: {
        desktop: 'Escritorio',
        mobile: 'Móvil',
        tablet: 'Tablet'
    },
    frustration: {
        rage: { label: 'Clics de rabia', detail: '3+ clics en el mismo punto en menos de 1 s' },
        dead: { label: 'Clics muertos', detail: 'Clic sin cambio en la página ni en la red' },
        error: { label: 'Clics con error', detail: 'Un error JS justo después del clic' },
        uturn: { label: 'Vuelta atrás', detail: 'Vuelve a la página anterior en menos de 7 s' }
    },
    connections: {
        cellular: 'Datos móviles',
        slow2g: '2G lenta'
    },
    frequency: {
        once: '1 sesión',
        orMore: (count: string) => `${count} o más`,
        range: (range: string) => `${range} sesiones`
    },
    releaseErrors: (share: string) => `${share} con error`,
    places: {
        title: 'Dónde están',
        countries: 'Países',
        cities: 'Ciudades',
        languages: 'Idiomas',
        outside: (country: string) => `Fuera de ${country}`,
        outsideTop: 'Fuera del país principal',
        vsPrevious: 'vs. el periodo anterior',
        groupBy: 'Agrupar por',
        byPlace: 'Sesiones por lugar',
        noVisits: 'Sin visitas en este periodo.',
        showLess: 'Mostrar menos',
        showAll: (count: string) => `Mostrar los ${count}`
    },
    trends: {
        indicator: 'Indicador'
    },
    audience: {
        title: 'Audiencia',
        returningTab: 'Recurrencia',
        nowTab: 'Ahora',
        returning: 'Recurrentes',
        fresh: 'Nuevas',
        visits: 'Cuántas veces vinieron',
        connecting: 'Conectando…',
        liveNow: (count: number) => `${count === 1 ? 'persona' : 'personas'} en la app ahora`,
        livePages: 'Páginas con personas ahora',
        nobody: 'Nadie está navegando en este momento.'
    },
    technology: {
        title: 'Tecnología',
        system: 'Sistema',
        systems: 'Sistemas operativos',
        browser: 'Navegador',
        browsers: 'Navegadores',
        device: 'Dispositivo',
        devices: 'Dispositivos',
        screen: 'Pantalla',
        screens: 'Pantallas',
        network: 'Red',
        connection: 'Conexión'
    },
    acquisition: {
        title: 'Adquisición',
        channels: 'Canales',
        sources: 'Fuentes',
        campaigns: 'Campañas'
    },
    content: {
        title: 'Contenido',
        top: 'Más vistas',
        topPages: 'Páginas más vistas',
        entries: 'Entrada',
        entryPages: 'Páginas de entrada',
        exits: 'Salida',
        exitPages: 'Páginas de salida'
    },
    behaviour: {
        title: 'Comportamiento',
        activeTime: 'Tiempo activo',
        scroll: 'Scroll medio',
        clicksPerSession: 'Clics por sesión',
        sessionsPerPerson: 'Sesiones por persona',
        duration: 'Duración',
        depth: 'Páginas',
        hours: 'Horario'
    },
    rhythm: {
        peak: 'Hora pico',
        busiest: 'Día más activo',
        night: 'De noche, 20–02 h',
        unit: 'sesiones'
    },
    interaction: {
        title: 'Interacción',
        customEvents: 'Eventos propios',
        people: (count: number) => `${fmt.n(count)} ${count === 1 ? 'persona' : 'personas'}`,
        frustration: 'Frustración',
        signals: 'Señales de frustración'
    },
    performance: {
        title: 'Rendimiento',
        releases: 'Versiones',
        appReleases: 'Versiones de la app'
    },
    vitals: {
        lcp: 'Mayor contenido visible',
        inp: 'Respuesta a la interacción',
        cls: 'Estabilidad visual',
        fcp: 'Primer contenido',
        ttfb: 'Respuesta del servidor',
        good: 'Bueno',
        needsImprovement: 'Mejorable',
        poor: 'Malo',
        empty: 'Aún no hay mediciones en este periodo.'
    },
    topIssues: {
        label: 'Errores abiertos',
        empty: 'No hay errores abiertos en este periodo.',
        sessions: (count: number) => `${fmt.n(count)} ${count === 1 ? 'sesión' : 'sesiones'}`
    }
};
