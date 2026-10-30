export default {
    views: {
        overview: 'Resumen',
        sessions: 'Sesiones',
        events: 'Eventos',
        heatmaps: 'Mapas de calor',
        funnels: 'Embudos',
        journeys: 'Recorridos',
        retention: 'Retención',
        issues: 'Errores',
        settings: 'Ajustes de la app'
    },
    actionsOf: (subject: string) => `Acciones de ${subject}`,
    backTo: (label: string) => `Volver a ${label}`,
    close: 'Cerrar',
    copy: 'Copiar',
    copied: 'Copiado',
    worldMap: 'Mapa de personas por país',
    chart: {
        sessions: 'Sesiones',
        errored: 'Con error',
        quiet: 'Tranquilo',
        peak: 'Pico'
    },
    carbon: {
        'open.menu': 'Abrir menú',
        'close.menu': 'Cerrar menú',
        'clear.all': 'Quitar todo',
        'clear.selection': 'Quitar selección'
    },
    errors: {
        forbidden: 'Tu rol no permite hacer esto.',
        unauthorized: 'Tu sesión terminó. Vuelve a entrar.',
        tooManyRequests: 'Demasiados intentos. Espera un momento y vuelve a probar.',
        validationFailed: 'Revisa los campos marcados.',
        projectNotFound: 'Esta app ya no existe.',
        offline: 'No hay conexión con Condor. Revisa que los servicios estén en marcha.',
        unknown: 'Algo salió mal. Vuelve a intentarlo.'
    }
};
