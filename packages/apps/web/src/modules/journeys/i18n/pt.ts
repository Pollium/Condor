import type es from '@/modules/journeys/i18n/es';
import { fmt } from '@/shared/utils/format';

const sessions = (count: number) => `${fmt.n(count)} ${count === 1 ? 'sessão' : 'sessões'}`;

const pages = (count: number) => `${fmt.n(count)} ${count === 1 ? 'página' : 'páginas'}`;

const pt: typeof es = {
    page: {
        steps: (count: number) => `${count} ${count === 1 ? 'etapa' : 'etapas'}`,
        stepsLabel: 'Etapas',
        withExits: 'Com saídas',
        withoutExits: 'Sem saídas',
        exitsLabel: 'Saídas',
        from: (start: string) => `A partir de ${start}`,
        loadFailed: 'Não foi possível carregar as jornadas',
        retry: 'Tentar novamente',
        loading: 'Seguindo as sessões…',
        noneFrom: (start: string) => `Nenhuma sessão começa em ${start}`,
        noneFromHint: 'Tente outra página inicial ou um período mais longo.',
        emptyTitle: 'Ainda não há jornadas neste período',
        emptyHint: 'Quando as pessoas navegarem pelo seu app, você verá aqui o caminho que elas seguem entre as páginas.'
    },
    startPicker: {
        label: 'Página inicial',
        placeholder: 'De qualquer página'
    },
    view: {
        sessions: 'Sessões',
        sessionCount: sessions,
        startsAt: (start: string) => `Começam em ${start}`,
        anyStart: 'Com pelo menos uma página vista',
        continued: 'Continuam após a primeira etapa',
        leftFirst: (count: number) => `${sessions(count)} ${count === 1 ? 'sai' : 'saem'} na primeira página`,
        topRoute: 'Rota mais comum',
        thenLeave: 'E saem',
        flow: 'Fluxo entre páginas',
        hover: 'Passe o cursor sobre uma página ou uma faixa para ver quantas sessões seguem esse caminho.',
        routes: 'Rotas mais comuns',
        noRoutes: 'Ainda não há rotas para mostrar.',
        pages,
        pagesThenLeave: (count: number) => `${pages(count)} e saem`
    },
    nodes: {
        page: 'Página',
        other: 'Outras páginas',
        exit: 'Saída'
    },
    sankey: {
        label: 'Fluxo de sessões entre páginas',
        entry: 'Entrada',
        step: (step: number) => `Etapa ${step}`,
        ofColumn: 'Da coluna',
        onward: 'Continuam',
        ofSource: (label: string) => `De ${label}`
    }
};

export default pt;
