import { fmt } from '@/shared/utils/format';

const sessions = (count: number) => `${fmt.n(count)} ${count === 1 ? 'sesión' : 'sesiones'}`;

const pages = (count: number) => `${fmt.n(count)} ${count === 1 ? 'página' : 'páginas'}`;

export default {
    page: {
        steps: (count: number) => `${count} ${count === 1 ? 'paso' : 'pasos'}`,
        stepsLabel: 'Pasos',
        withExits: 'Con salidas',
        withoutExits: 'Sin salidas',
        exitsLabel: 'Salidas',
        from: (start: string) => `Desde ${start}`,
        loadFailed: 'No pudimos cargar los recorridos',
        retry: 'Reintentar',
        loading: 'Siguiendo las sesiones…',
        noneFrom: (start: string) => `Ninguna sesión empieza en ${start}`,
        noneFromHint: 'Prueba con otra página de inicio o un periodo más largo.',
        emptyTitle: 'Aún no hay recorridos en este periodo',
        emptyHint: 'Cuando las personas naveguen por tu app verás aquí el camino que siguen entre páginas.'
    },
    startPicker: {
        label: 'Página de inicio',
        placeholder: 'Desde cualquier página'
    },
    view: {
        sessions: 'Sesiones',
        sessionCount: sessions,
        startsAt: (start: string) => `Empiezan en ${start}`,
        anyStart: 'Con al menos una página vista',
        continued: 'Siguen tras el primer paso',
        leftFirst: (count: number) => `${sessions(count)} ${count === 1 ? 'se va' : 'se van'} en la primera página`,
        topRoute: 'Ruta más común',
        thenLeave: 'Y se van',
        flow: 'Flujo entre páginas',
        hover: 'Pasa el cursor por una página o una franja para ver cuántas sesiones siguen ese camino.',
        routes: 'Rutas más comunes',
        noRoutes: 'Aún no hay rutas que mostrar.',
        pages,
        pagesThenLeave: (count: number) => `${pages(count)} y se van`
    },
    nodes: {
        page: 'Página',
        other: 'Otras páginas',
        exit: 'Salida'
    },
    sankey: {
        label: 'Flujo de sesiones entre páginas',
        entry: 'Entrada',
        step: (step: number) => `Paso ${step}`,
        ofColumn: 'De la columna',
        onward: 'Siguen',
        ofSource: (label: string) => `De ${label}`
    }
};
