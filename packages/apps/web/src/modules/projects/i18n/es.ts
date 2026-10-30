import { fmt } from '@/shared/utils/format';

export default {
    cancel: 'Cancelar',
    platforms: {
        web: 'Web',
        server: 'Servidor o API HTTP'
    },
    home: {
        loading: 'Cargando tus apps…',
        hint: 'Sin apps todavía',
        title: 'Conecta tu primera app',
        description: 'Cada app tiene su propia clave. Instalas el SDK con una línea y las sesiones, métricas y errores empiezan a llegar.',
        add: 'Añadir una app'
    },
    addApp: {
        title: 'Añadir una app',
        source: 'Desde dónde envía datos',
        platform: 'Plataforma',
        name: 'Nombre',
        domain: 'Dominio',
        serviceHost: 'Host del servicio',
        domainHelper: 'Las visitas desde este dominio no cuentan como referencias externas.',
        serviceHelper: 'Solo para reconocerlo en la lista de apps.',
        create: 'Crear app'
    },
    connect: {
        hint: (platform: string) => `${platform} · esperando el primer evento`,
        title: (name: string) => `Conecta ${name}`,
        webLead: 'Instala el SDK y las métricas y grabaciones empiezan a llegar solas.',
        serverLead: 'Envía eventos desde tu backend con una petición HTTP.',
        installStep: 'Instala el SDK',
        sendStep: 'Envía un evento',
        identifyStep: 'Identifica a las personas',
        optional: 'Opcional',
        firstEvent: 'Primer evento',
        httpStep: 'Envía eventos por HTTP',
        install: 'Instalación',
        httpNote: 'Cualquier lenguaje sirve: es un POST con tu clave pública.',
        scriptNote: 'Pega esto antes de </head> en todas las páginas.',
        npmNote: 'Inicialízalo una vez al arrancar tu app.',
        identifyNote: 'Así cada sesión lleva un nombre y puedes buscarla por correo.',
        testFailed: 'No llegó el evento de prueba',
        testFailedHint: 'Revisa que el colector esté en marcha y que esta consola lo alcance en /i.',
        waiting: (host: string) => `Esperando datos de ${host}…`,
        sending: 'Enviando…',
        sendTest: 'Enviar evento de prueba'
    },
    settings: {
        title: 'Ajustes',
        readOnly: 'Tu rol es de lectura.'
    },
    save: {
        saving: 'Guardando…',
        saved: 'Guardado',
        failed: 'No se guardó'
    },
    install: {
        title: 'Instalación',
        notes: {
            script: 'Pega el fragmento antes de </head> en todas las páginas.',
            npm: 'Inicializa el SDK una vez al arrancar tu app.',
            http: 'Cualquier lenguaje sirve: es un POST con la clave pública.'
        },
        publicKey: 'Clave pública',
        keyCopied: 'Copiada',
        snippet: 'Fragmento de instalación',
        showCode: 'Ver el código',
        variant: 'Variante',
        rotate: 'Rotar la clave',
        rotateDetail: 'La clave actual deja de funcionar al instante.',
        rotateAction: 'Rotar'
    },
    rotateKey: {
        heading: '¿Rotar la clave pública?',
        confirm: 'Rotar la clave',
        rotating: 'Rotando…',
        lead: (name: string) => `${name} recibirá una clave nueva. La actual, `,
        tail: ', deja de funcionar en cuanto confirmes: los eventos y grabaciones que la usen se rechazan.',
        update: 'Actualiza el fragmento en tu sitio o tu backend justo después.'
    },
    app: {
        title: 'App',
        note: 'La zona horaria decide dónde empieza cada día en los gráficos y en el estado de abajo.',
        name: 'Nombre',
        domain: 'Dominio',
        color: 'Color',
        timezone: 'Zona horaria'
    },
    privacy: {
        title: 'Privacidad',
        note: 'Lo oculto se ve en la reproducción como un bloque vacío del mismo tamaño. Con «No rastrear» activo en el navegador no se envía nada.',
        maskInputs: 'Ocultar lo que se escribe',
        maskText: 'Ocultar todo el texto',
        respectDnt: 'Respetar «No rastrear»',
        blockSelector: 'Nunca grabar estos elementos'
    },
    recording: {
        title: 'Grabación',
        note: 'Las métricas cuentan todas las sesiones; solo las grabaciones siguen la muestra. Al vencer el plazo se borran eventos y grabaciones.',
        enabled: 'Grabar sesiones',
        sample: 'Sesiones que se graban',
        percent: (value: number) => `${value} %`,
        keepFor: 'Guardar durante',
        days: (count: number) => count === 1 ? '1 día' : `${fmt.n(count)} días`,
        years: (count: number) => count === 1 ? '1 año' : `${fmt.n(count)} años`
    },
    capture: {
        title: 'Red y consola',
        note: 'Authorization y Cookie nunca se guardan. Las peticiones y la consola aparecen junto a la reproducción.',
        network: 'Capturar las peticiones de red',
        console: 'Capturar la consola'
    },
    routes: {
        title: 'Agrupar rutas',
        param: ':nombre',
        paramNote: ' reemplaza un segmento y ',
        restNote: ' todo lo que sigue. Así /productos/zapatilla y /productos/polera cuentan como /productos/:slug.',
        remove: (pattern: string) => `Quitar ${pattern}`,
        empty: 'Cada ruta se cuenta por separado.',
        pattern: 'Nuevo patrón',
        placeholder: '/productos/:slug',
        invalid: 'Empieza con /',
        add: 'Añadir'
    },
    conversion: {
        title: 'Conversión',
        note: 'Una sesión cuenta como convertida cuando envía este evento. Elige uno de los vistos en 90 días o escribe otro; vacío, ninguna se marca.',
        event: 'Evento que marca la conversión',
        none: 'Ninguno'
    },
    status: {
        title: 'Estado',
        checking: 'Comprobando…',
        noEvents: 'Aún no llega ningún evento',
        lastEvent: (ago: string) => `Último evento ${ago}`,
        today: (summary: string) => `Hoy: ${summary}`,
        events: (count: number) => count === 1 ? '1 evento' : `${fmt.n(count)} eventos`,
        sessions: (count: number) => count === 1 ? '1 sesión' : `${fmt.n(count)} sesiones`,
        replays: (count: number) => count === 1 ? '1 grabación' : `${fmt.n(count)} grabaciones`,
        dayStarts: (timezone: string) => `El día empieza a medianoche en ${timezone}.`,
        check: 'Comprobar'
    },
    danger: {
        title: 'Zona de peligro',
        note: 'Eliminar la app borra sus eventos, sesiones y grabaciones. No se puede deshacer.',
        remove: 'Eliminar la app',
        removeAction: 'Eliminar',
        heading: (name: string) => `¿Eliminar ${name}?`,
        removing: 'Eliminando…',
        warning: (host: string) => `Se borran para siempre todos los datos de ${host}. El fragmento instalado deja de enviar eventos.`,
        confirm: (name: string) => `Escribe ${name} para confirmar`
    }
};
