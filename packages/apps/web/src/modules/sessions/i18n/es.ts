import { fmt } from '@/shared/utils/format';

const count = (value: number, one: string, many: string) => `${fmt.n(value)} ${value === 1 ? one : many}`;

export default {
    devices: {
        desktop: 'Escritorio',
        mobile: 'Móvil',
        tablet: 'Tableta'
    },
    allDevices: 'Todos los dispositivos',
    channels: {
        direct: 'Directo',
        organic: 'Búsqueda',
        paid: 'Anuncios',
        social: 'Redes sociales',
        messaging: 'Mensajería',
        email: 'Correo',
        ai: 'Asistentes de IA',
        referral: 'Otros sitios'
    },
    flags: {
        error: 'Con errores',
        rage: 'Con clics de rabia',
        dead: 'Con clics muertos',
        uturn: 'Con vueltas atrás',
        converted: 'Que convirtieron',
        identified: 'Con cuenta',
        replay: 'Con grabación'
    },
    sorts: {
        recent: 'Más recientes',
        longest: 'Más largas',
        events: 'Más eventos',
        frustrated: 'Más frustradas'
    },
    anonymous: 'Persona anónima',
    live: 'En vivo',
    pages: (value: number) => count(value, 'página', 'páginas'),
    counts: {
        errors: (value: number) => count(value, 'error', 'errores'),
        rage: (value: number) => count(value, 'clic de rabia', 'clics de rabia'),
        dead: (value: number) => count(value, 'clic muerto', 'clics muertos'),
        uturns: (value: number) => count(value, 'vuelta atrás', 'vueltas atrás')
    },
    list: {
        loadFailed: 'No pudimos cargar las sesiones',
        retry: 'Reintentar',
        loading: 'Cargando sesiones…',
        only: (country: string | null, person: boolean) =>
            `Solo sesiones ${[country && `de ${country}`, person && 'de una persona'].filter(Boolean).join(' y ')}`,
        seeAll: 'Ver todas',
        hint: 'Clic para reproducir. Con una sesión enfocada, Espacio abre una vista rápida.',
        previousPage: 'Página anterior',
        nextPage: 'Página siguiente',
        perPage: 'Por página',
        page: 'Página',
        range: (min: number, max: number, total: number) => `${fmt.n(min)}–${fmt.n(max)} de ${fmt.n(total)}`,
        ofPages: (pages: number) => `de ${count(pages, 'página', 'páginas')}`
    },
    toolbar: {
        total: (value: number) => count(value, 'sesión', 'sesiones'),
        searchLabel: 'Buscar sesiones',
        searchPlaceholder: 'Persona, correo o página',
        clearSearch: 'Borrar',
        sort: 'Ordenar',
        device: 'Dispositivo',
        filters: 'Filtros'
    },
    sessionList: {
        rage: 'Clics de rabia',
        dead: 'Clics muertos',
        converted: 'Convirtió',
        noReplay: 'Sin grabación',
        at: (path: string) => `en ${path}`,
        noMatch: 'Ninguna sesión coincide',
        noMatchHint: 'Quita algún filtro o busca otra cosa.',
        empty: 'Todavía no hay sesiones',
        emptyHint: 'Las sesiones aparecen aquí en cuanto el sitio envía su primer evento.'
    },
    quickLook: {
        open: 'Abrir sesión'
    },
    session: {
        title: 'Sesión',
        openFailed: 'No pudimos abrir la sesión',
        copyLink: 'Copiar enlace',
        linkCopied: 'Enlace copiado'
    },
    stats: {
        duration: 'Duración',
        active: (duration: string) => `${duration} con actividad`,
        pages: 'Páginas',
        exitsOn: (path: string) => `sale en ${path}`,
        events: 'Eventos',
        converted: 'Convirtió',
        notConverted: 'Sin conversión',
        friction: 'Fricción',
        noSignals: 'Sin señales'
    },
    replay: {
        loading: 'Cargando la grabación…',
        missing: 'Esta sesión no tiene grabación',
        missingHint: 'La grabación estaba desactivada o la página no la permitió. Los eventos y los datos de la persona siguen disponibles.',
        failed: 'No pudimos cargar la grabación',
        failedHint: 'Los eventos y los datos de la persona siguen disponibles. Vuelve a intentarlo en un momento.',
        skipping: 'Saltando un tramo sin actividad'
    },
    controls: {
        position: 'Posición',
        play: 'Reproducir',
        pause: 'Pausar',
        back: 'Retroceder 10 segundos',
        forward: 'Avanzar 10 segundos',
        speed: 'Velocidad',
        options: 'Opciones de reproducción',
        skipInactive: 'Saltar la inactividad',
        skipInactiveHint: 'Pasa de largo los tramos sin movimiento'
    },
    panel: {
        label: 'Detalle de la sesión',
        events: 'Eventos',
        console: 'Consola',
        network: 'Red',
        person: 'Persona'
    },
    timeline: {
        label: 'Eventos de la sesión',
        empty: 'Sin eventos',
        emptyHint: 'Esta sesión no registró páginas, clics ni errores.',
        opens: (path: string) => `Abre ${path}`,
        click: 'Clic',
        rageClick: 'Clic de rabia',
        deadClick: 'Clic muerto',
        clickOn: (kind: string, text: string) => `${kind} en «${text}»`,
        error: 'Error',
        identifies: 'Se identifica',
        event: 'Evento',
        metric: 'Métrica',
        ratings: {
            good: 'Resultado bueno',
            needsImprovement: 'Resultado mejorable',
            poor: 'Resultado lento'
        }
    },
    console: {
        empty: 'Consola vacía',
        emptyHint: 'La grabación no registró mensajes de consola.'
    },
    network: {
        failed: 'Falló',
        empty: 'Sin peticiones',
        emptyHint: 'La grabación no registró peticiones de red.'
    },
    person: {
        name: 'Nombre',
        email: 'Correo',
        userId: 'ID de usuario',
        place: 'Lugar',
        device: 'Dispositivo',
        os: 'Sistema',
        browser: 'Navegador',
        language: 'Idioma',
        timezone: 'Zona horaria',
        connection: 'Conexión',
        channel: 'Canal',
        referrer: 'Llegó desde',
        campaign: 'Campaña',
        release: 'Versión',
        firstSeen: 'Con nosotros desde',
        anonymousId: 'Identificador',
        others: 'Otras sesiones',
        seeAll: 'Ver todas',
        recorded: 'Grabada'
    },
    errors: {
        notFound: 'Esta sesión ya no existe o pertenece a otra app.'
    }
};
