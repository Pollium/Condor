import { fmt } from '@/shared/utils/format';

export default {
    page: {
        hint: (open: number, sessions: number) => `${fmt.n(open)} sin resolver · ${sessions === 1 ? '1 sesión afectada' : `${fmt.n(sessions)} sesiones afectadas`}`,
        searchLabel: 'Buscar errores',
        searchPlaceholder: 'Buscar',
        clearSearch: 'Borrar la búsqueda',
        status: 'Estado',
        grouped: 'Errores agrupados',
        noMatch: 'Ningún error coincide',
        noMatchHint: 'Prueba con otro estado o busca otra cosa.',
        empty: 'Sin errores en este periodo',
        emptyHint: 'Cuando tu app lance una excepción aparecerá aquí, agrupada con las demás del mismo tipo.'
    },
    filters: {
        all: 'Todos',
        open: 'Sin resolver',
        resolved: 'Resueltos',
        ignored: 'Ignorados'
    },
    states: {
        new: 'Nuevo',
        open: 'Abierto',
        regressed: 'Reapareció',
        resolved: 'Resuelto',
        ignored: 'Ignorado'
    },
    sessions: (count: number) => `${fmt.n(count)} ${count === 1 ? 'sesión' : 'sesiones'}`,
    detail: {
        occurrences: 'Ocurrencias',
        sessions: 'Sesiones',
        people: 'Personas',
        since: 'Desde',
        lastSeen: (ago: string) => `Última vez ${ago}`,
        lastDay: 'Últimas 24 horas',
        trace: 'Traza'
    },
    actions: {
        viewSession: 'Ver una sesión',
        more: 'Más acciones',
        resolve: 'Resolver',
        ignore: 'Ignorar',
        reopen: 'Reabrir'
    },
    errors: {
        notFound: 'Este error ya no existe.'
    }
};
