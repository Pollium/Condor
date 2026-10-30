import type es from '@/modules/sessions/i18n/es';
import { fmt } from '@/shared/utils/format';

const count = (value: number, one: string, many: string) => `${fmt.n(value)} ${value === 1 ? one : many}`;

const pt: typeof es = {
    devices: {
        desktop: 'Desktop',
        mobile: 'Celular',
        tablet: 'Tablet'
    },
    allDevices: 'Todos os dispositivos',
    channels: {
        direct: 'Direto',
        organic: 'Busca',
        paid: 'Anúncios',
        social: 'Redes sociais',
        messaging: 'Mensagens',
        email: 'E-mail',
        ai: 'Assistentes de IA',
        referral: 'Outros sites'
    },
    flags: {
        error: 'Com erros',
        rage: 'Com cliques de raiva',
        dead: 'Com cliques mortos',
        uturn: 'Com meias-voltas',
        converted: 'Que converteram',
        identified: 'Identificadas',
        replay: 'Com gravação'
    },
    sorts: {
        recent: 'Mais recentes',
        longest: 'Mais longas',
        events: 'Mais eventos',
        frustrated: 'Mais frustradas'
    },
    anonymous: 'Pessoa anônima',
    live: 'Ao vivo',
    pages: (value: number) => count(value, 'página', 'páginas'),
    counts: {
        errors: (value: number) => count(value, 'erro', 'erros'),
        rage: (value: number) => count(value, 'clique de raiva', 'cliques de raiva'),
        dead: (value: number) => count(value, 'clique morto', 'cliques mortos'),
        uturns: (value: number) => count(value, 'meia-volta', 'meias-voltas')
    },
    list: {
        loadFailed: 'Não foi possível carregar as sessões',
        retry: 'Tentar de novo',
        loading: 'Carregando sessões…',
        only: (country: string | null, person: boolean) =>
            `Só sessões ${[country && `do país ${country}`, person && 'de uma pessoa'].filter(Boolean).join(' e ')}`,
        seeAll: 'Ver todas',
        hint: 'Clique para reproduzir. Com uma sessão em foco, Espaço abre uma prévia rápida.',
        previousPage: 'Página anterior',
        nextPage: 'Próxima página',
        perPage: 'Por página',
        page: 'Página',
        range: (min: number, max: number, total: number) => `${fmt.n(min)}–${fmt.n(max)} de ${fmt.n(total)}`,
        ofPages: (pages: number) => `de ${count(pages, 'página', 'páginas')}`
    },
    toolbar: {
        total: (value: number) => count(value, 'sessão', 'sessões'),
        searchLabel: 'Buscar sessões',
        searchPlaceholder: 'Pessoa, e-mail ou página',
        clearSearch: 'Limpar',
        sort: 'Ordenar',
        device: 'Dispositivo',
        filters: 'Filtros'
    },
    sessionList: {
        rage: 'Cliques de raiva',
        dead: 'Cliques mortos',
        converted: 'Converteu',
        noReplay: 'Sem gravação',
        at: (path: string) => `em ${path}`,
        noMatch: 'Nenhuma sessão corresponde',
        noMatchHint: 'Remova algum filtro ou busque outra coisa.',
        empty: 'Ainda não há sessões',
        emptyHint: 'As sessões aparecem aqui assim que o site envia o primeiro evento.'
    },
    quickLook: {
        open: 'Abrir sessão'
    },
    session: {
        title: 'Sessão',
        openFailed: 'Não foi possível abrir a sessão',
        copyLink: 'Copiar link',
        linkCopied: 'Link copiado'
    },
    stats: {
        duration: 'Duração',
        active: (duration: string) => `${duration} com atividade`,
        pages: 'Páginas',
        exitsOn: (path: string) => `sai em ${path}`,
        events: 'Eventos',
        converted: 'Converteu',
        notConverted: 'Sem conversão',
        friction: 'Atrito',
        noSignals: 'Sem sinais'
    },
    replay: {
        loading: 'Carregando a gravação…',
        missing: 'Esta sessão não tem gravação',
        missingHint: 'A gravação estava desativada ou a página não permitiu. Os eventos e os dados da pessoa continuam disponíveis.',
        failed: 'Não foi possível carregar a gravação',
        failedHint: 'Os eventos e os dados da pessoa continuam disponíveis. Tente de novo em instantes.',
        skipping: 'Pulando um trecho sem atividade'
    },
    controls: {
        position: 'Posição',
        play: 'Reproduzir',
        pause: 'Pausar',
        back: 'Voltar 10 segundos',
        forward: 'Avançar 10 segundos',
        speed: 'Velocidade',
        options: 'Opções de reprodução',
        skipInactive: 'Pular a inatividade',
        skipInactiveHint: 'Passa direto pelos trechos sem movimento'
    },
    panel: {
        label: 'Detalhes da sessão',
        events: 'Eventos',
        console: 'Console',
        network: 'Rede',
        person: 'Pessoa'
    },
    timeline: {
        label: 'Eventos da sessão',
        empty: 'Sem eventos',
        emptyHint: 'Esta sessão não registrou páginas, cliques nem erros.',
        opens: (path: string) => `Abre ${path}`,
        click: 'Clique',
        rageClick: 'Clique de raiva',
        deadClick: 'Clique morto',
        clickOn: (kind: string, text: string) => `${kind} em “${text}”`,
        error: 'Erro',
        identifies: 'Se identifica',
        event: 'Evento',
        metric: 'Métrica',
        ratings: {
            good: 'Bom',
            needsImprovement: 'Precisa melhorar',
            poor: 'Ruim'
        }
    },
    console: {
        empty: 'Console vazio',
        emptyHint: 'A gravação não registrou mensagens de console.'
    },
    network: {
        failed: 'Falhou',
        empty: 'Sem requisições',
        emptyHint: 'A gravação não registrou requisições de rede.'
    },
    person: {
        name: 'Nome',
        email: 'E-mail',
        userId: 'ID de usuário',
        place: 'Local',
        device: 'Dispositivo',
        os: 'Sistema',
        browser: 'Navegador',
        language: 'Idioma',
        timezone: 'Fuso horário',
        connection: 'Conexão',
        channel: 'Canal',
        referrer: 'Veio de',
        campaign: 'Campanha',
        release: 'Versão',
        firstSeen: 'Primeira visita',
        anonymousId: 'Identificador',
        others: 'Outras sessões',
        seeAll: 'Ver todas',
        recorded: 'Gravada'
    },
    errors: {
        notFound: 'Esta sessão não existe mais ou pertence a outro app.'
    }
};

export default pt;
