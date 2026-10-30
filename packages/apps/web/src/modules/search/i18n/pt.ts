import type es from '@/modules/search/i18n/es';
import { fmt } from '@/shared/utils/format';

const pt: typeof es = {
    title: 'Buscar',
    label: 'Buscar no Condor',
    placeholder: 'Pessoas, erros, páginas, apps ou visões',
    clear: 'Limpar',
    searching: 'Buscando…',
    noMatch: (query: string) => `Nada corresponde a “${query}”.`,
    people: 'Pessoas',
    anonymous: 'Anônimo',
    sessions: (count: number) => count === 1 ? '1 sessão' : `${fmt.n(count)} sessões`,
    issues: 'Erros',
    pages: 'Páginas',
    views: (count: number) => count === 1 ? '1 visualização' : `${fmt.n(count)} visualizações`,
    apps: 'Apps',
    goTo: 'Ir para'
};

export default pt;
