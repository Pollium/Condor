import { fmt } from '@/shared/utils/format';

export default {
    title: 'Buscar',
    label: 'Buscar en Condor',
    placeholder: 'Personas, errores, páginas, apps o vistas',
    clear: 'Borrar',
    searching: 'Buscando…',
    noMatch: (query: string) => `Nada coincide con «${query}».`,
    people: 'Personas',
    anonymous: 'Anónimo',
    sessions: (count: number) => count === 1 ? '1 sesión' : `${fmt.n(count)} sesiones`,
    issues: 'Errores',
    pages: 'Páginas',
    views: (count: number) => count === 1 ? '1 vista' : `${fmt.n(count)} vistas`,
    apps: 'Apps',
    goTo: 'Ir a'
};
