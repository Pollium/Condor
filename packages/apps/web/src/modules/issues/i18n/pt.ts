import type es from '@/modules/issues/i18n/es';
import { fmt } from '@/shared/utils/format';

const pt: typeof es = {
    page: {
        hint: (open: number, sessions: number) => `${open === 1 ? '1 não resolvido' : `${fmt.n(open)} não resolvidos`} · ${sessions === 1 ? '1 sessão afetada' : `${fmt.n(sessions)} sessões afetadas`}`,
        searchLabel: 'Buscar erros',
        searchPlaceholder: 'Buscar',
        clearSearch: 'Limpar a busca',
        status: 'Status',
        grouped: 'Erros agrupados',
        noMatch: 'Nenhum erro corresponde',
        noMatchHint: 'Tente outro status ou busque outra coisa.',
        empty: 'Sem erros neste período',
        emptyHint: 'Quando seu app lançar uma exceção, ela aparecerá aqui, agrupada com as demais do mesmo tipo.'
    },
    filters: {
        all: 'Todos',
        open: 'Não resolvidos',
        resolved: 'Resolvidos',
        ignored: 'Ignorados'
    },
    states: {
        new: 'Novo',
        open: 'Aberto',
        regressed: 'Reapareceu',
        resolved: 'Resolvido',
        ignored: 'Ignorado'
    },
    sessions: (count: number) => `${fmt.n(count)} ${count === 1 ? 'sessão' : 'sessões'}`,
    detail: {
        occurrences: 'Ocorrências',
        sessions: 'Sessões',
        people: 'Pessoas',
        since: 'Desde',
        lastSeen: (ago: string) => `Última vez ${ago}`,
        lastDay: 'Últimas 24 horas',
        trace: 'Stack trace'
    },
    actions: {
        viewSession: 'Ver uma sessão',
        more: 'Mais ações',
        resolve: 'Resolver',
        ignore: 'Ignorar',
        reopen: 'Reabrir'
    },
    errors: {
        notFound: 'Este erro não existe mais.'
    }
};

export default pt;
