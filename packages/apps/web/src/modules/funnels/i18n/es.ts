import { fmt } from '@/shared/utils/format';

export default {
    windows: {
        hours: (hours: number) => `En ${hours} h`,
        days: (days: number) => days === 1 ? 'En 1 día' : `En ${days} días`
    },
    devices: {
        desktop: 'Escritorio',
        mobile: 'Móvil',
        tablet: 'Tableta'
    },
    days: (days: string) => `${days} días`,
    sameAsBefore: 'Igual que antes',
    pointsVsBefore: (points: string) => `${points} pts vs. antes`,
    page: {
        loadFailed: 'No pudimos cargar los embudos',
        retry: 'Reintentar',
        loading: 'Cargando embudos…',
        emptyTitle: 'Aún no hay embudos',
        emptyHint: 'Un embudo sigue a las personas por una serie de pasos, páginas que visitan o eventos que envía tu app, y muestra cuántas llegan a cada uno y dónde se quedan.',
        createFirst: 'Crear el primer embudo',
        steps: (count: number) => count === 1 ? '1 paso' : `${fmt.n(count)} pasos`,
        funnel: 'Embudo',
        window: 'Ventana de conversión',
        create: 'Nuevo embudo',
        edit: 'Editar embudo',
        remove: 'Eliminar embudo'
    },
    results: {
        failed: 'No pudimos calcular el embudo',
        retry: 'Reintentar',
        loading: 'Calculando el embudo…',
        emptyTitle: 'Nadie empieza este embudo en el periodo',
        emptyHint: 'Prueba con un periodo más largo, o revisa que el primer paso coincida con una página o un evento que tu app envía.',
        chart: 'Personas en cada paso'
    },
    stats: {
        conversion: 'Conversión total',
        complete: 'Completan',
        ofStarting: (count: number) => count === 1 ? 'de 1 que empieza' : `de ${fmt.n(count)} que empiezan`,
        medianTime: 'Tiempo mediano',
        firstToLast: 'Del primer paso al último',
        biggestDrop: 'Mayor abandono',
        before: (step: string) => `Antes de «${step}»`,
        noneYet: 'Aún nadie empieza'
    },
    chart: {
        start: 'Inicio',
        continued: (share: string) => `${share} siguen`,
        reach: 'Llegan',
        fromStart: 'Desde el inicio',
        dropOff: 'Abandonan'
    },
    breakdown: {
        steps: 'Pasos',
        stepsLabel: 'Pasos del embudo',
        stepDetail: (match: string, dropped: number, median: string) =>
            `${match} · ${fmt.n(dropped)} ${dropped === 1 ? 'abandona' : 'abandonan'} · mediana ${median}`,
        start: 'Inicio',
        ofPrevious: (share: string) => `${share} del anterior`,
        devices: 'Conversión por dispositivo',
        noDevices: 'Aún nadie entra al embudo en este periodo.',
        deviceDetail: (entered: number, reached: number, step: string) =>
            `${fmt.n(entered)} ${entered === 1 ? 'entra' : 'entran'} · ${fmt.n(reached)} ${reached === 1 ? 'llega' : 'llegan'} a «${step}»`
    },
    editor: {
        create: 'Nuevo embudo',
        edit: 'Editar embudo',
        save: 'Guardar',
        saving: 'Guardando…',
        cancel: 'Cancelar',
        intro: 'Cuenta a las personas que hacen cada paso en orden, dentro de la ventana desde el primero.',
        name: 'Nombre',
        namePlaceholder: 'Compra',
        window: 'Ventana de conversión',
        maxSteps: (count: number) => `Hasta ${count} pasos`,
        addStep: 'Añadir paso'
    },
    stepField: {
        kinds: {
            page: 'Página',
            event: 'Evento'
        },
        step: (index: number) => `Paso ${index}`,
        kindOf: (index: number) => `Tipo del paso ${index}`,
        remove: 'Quitar paso',
        pageHelper: 'Una ruta; :parámetro vale cualquier valor',
        eventHelper: 'El nombre que envía tu app',
        pagePlaceholder: '/productos/:slug',
        label: 'Nombre del paso',
        labelHelper: 'Opcional; si lo dejas vacío se usa la página o el evento',
        labelPlaceholder: 'Ve un producto',
        whereKey: 'Solo si la propiedad',
        whereKeyHelper: 'Opcional; por ejemplo plan',
        whereValue: 'vale',
        whereValueHelper: 'El valor exacto que envía tu app'
    },
    deleteDialog: {
        heading: (name: string) => `¿Eliminar «${name}»?`,
        confirm: 'Eliminar',
        deleting: 'Eliminando…',
        cancel: 'Cancelar',
        body: 'Desaparece para todo el equipo. Las sesiones y los eventos no cambian.'
    },
    errors: {
        notFound: 'Este embudo ya no existe.'
    }
};
