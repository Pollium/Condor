import type es from '@/modules/projects/i18n/es';
import { fmt } from '@/shared/utils/format';

const pt: typeof es = {
    cancel: 'Cancelar',
    platforms: {
        web: 'Web',
        server: 'Servidor ou API HTTP'
    },
    home: {
        loading: 'Carregando seus apps…',
        hint: 'Nenhum app ainda',
        title: 'Conecte seu primeiro app',
        description: 'Cada app tem sua própria chave. Você instala o SDK com uma linha e as sessões, métricas e erros começam a chegar.',
        add: 'Adicionar um app'
    },
    addApp: {
        title: 'Adicionar um app',
        source: 'De onde envia dados',
        platform: 'Plataforma',
        name: 'Nome',
        domain: 'Domínio',
        serviceHost: 'Host do serviço',
        domainHelper: 'As visitas deste domínio não contam como referências externas.',
        serviceHelper: 'Só para reconhecê-lo na lista de apps.',
        create: 'Criar app'
    },
    connect: {
        hint: (platform: string) => `${platform} · aguardando o primeiro evento`,
        title: (name: string) => `Conecte ${name}`,
        webLead: 'Instale o SDK e as métricas e gravações começam a chegar sozinhas.',
        serverLead: 'Envie eventos do seu backend com uma requisição HTTP.',
        installStep: 'Instale o SDK',
        sendStep: 'Envie um evento',
        identifyStep: 'Identifique as pessoas',
        optional: 'Opcional',
        firstEvent: 'Primeiro evento',
        httpStep: 'Envie eventos por HTTP',
        install: 'Instalação',
        httpNote: 'Qualquer linguagem serve: é um POST com sua chave pública.',
        scriptNote: 'Cole isto antes de </head> em todas as páginas.',
        npmNote: 'Inicialize-o uma vez ao iniciar seu app.',
        identifyNote: 'Assim cada sessão leva um nome e você pode buscá-la por e-mail.',
        testFailed: 'O evento de teste não chegou',
        testFailedHint: 'Verifique se o coletor está em execução e se este console o alcança em /i.',
        waiting: (host: string) => `Aguardando dados de ${host}…`,
        sending: 'Enviando…',
        sendTest: 'Enviar evento de teste'
    },
    settings: {
        title: 'Configurações',
        readOnly: 'Sua função é somente leitura.'
    },
    save: {
        saving: 'Salvando…',
        saved: 'Salvo',
        failed: 'Não foi salvo'
    },
    install: {
        title: 'Instalação',
        notes: {
            script: 'Cole o snippet antes de </head> em todas as páginas.',
            npm: 'Inicialize o SDK uma vez ao iniciar seu app.',
            http: 'Qualquer linguagem serve: é um POST com a chave pública.'
        },
        publicKey: 'Chave pública',
        keyCopied: 'Copiada',
        snippet: 'Snippet de instalação',
        showCode: 'Ver o código',
        variant: 'Variante',
        rotate: 'Rotacionar a chave',
        rotateDetail: 'A chave atual deixa de funcionar na hora.',
        rotateAction: 'Rotacionar'
    },
    rotateKey: {
        heading: 'Rotacionar a chave pública?',
        confirm: 'Rotacionar a chave',
        rotating: 'Rotacionando…',
        lead: (name: string) => `${name} receberá uma chave nova. A atual, `,
        tail: ', deixa de funcionar assim que você confirmar: eventos e gravações que a usarem serão rejeitados.',
        update: 'Atualize o snippet no seu site ou backend logo em seguida.'
    },
    app: {
        title: 'App',
        note: 'O fuso horário define onde começa cada dia nos gráficos e no status abaixo.',
        name: 'Nome',
        domain: 'Domínio',
        color: 'Cor',
        timezone: 'Fuso horário'
    },
    privacy: {
        title: 'Privacidade',
        note: 'O que fica oculto aparece na reprodução como um bloco vazio do mesmo tamanho. Com “Não rastrear” ativo no navegador, nada é enviado.',
        maskInputs: 'Ocultar o que é digitado',
        maskText: 'Ocultar todo o texto',
        respectDnt: 'Respeitar “Não rastrear”',
        blockSelector: 'Nunca gravar estes elementos'
    },
    recording: {
        title: 'Gravação',
        note: 'As métricas contam todas as sessões; só as gravações seguem a amostra. Ao fim do prazo, eventos e gravações são apagados.',
        enabled: 'Gravar sessões',
        sample: 'Sessões gravadas',
        percent: (value: number) => `${value}%`,
        keepFor: 'Manter por',
        days: (count: number) => count === 1 ? '1 dia' : `${fmt.n(count)} dias`,
        years: (count: number) => count === 1 ? '1 ano' : `${fmt.n(count)} anos`
    },
    capture: {
        title: 'Rede e console',
        note: 'Authorization e Cookie nunca são salvos. As requisições e o console aparecem junto à reprodução.',
        network: 'Capturar as requisições de rede',
        console: 'Capturar o console'
    },
    routes: {
        title: 'Agrupar rotas',
        param: ':nome',
        paramNote: ' substitui um segmento e ',
        restNote: ' tudo o que vem depois. Assim /produtos/tenis e /produtos/camiseta contam como /produtos/:slug.',
        remove: (pattern: string) => `Remover ${pattern}`,
        empty: 'Cada rota é contada separadamente.',
        pattern: 'Novo padrão',
        placeholder: '/produtos/:slug',
        invalid: 'Comece com /',
        add: 'Adicionar'
    },
    conversion: {
        title: 'Conversão',
        note: 'Uma sessão conta como convertida quando envia este evento. Escolha um dos vistos em 90 dias ou digite outro; vazio, nenhuma é marcada.',
        event: 'Evento que marca a conversão',
        none: 'Nenhum'
    },
    status: {
        title: 'Status',
        checking: 'Verificando…',
        noEvents: 'Ainda não chegou nenhum evento',
        lastEvent: (ago: string) => `Último evento ${ago}`,
        today: (summary: string) => `Hoje: ${summary}`,
        events: (count: number) => count === 1 ? '1 evento' : `${fmt.n(count)} eventos`,
        sessions: (count: number) => count === 1 ? '1 sessão' : `${fmt.n(count)} sessões`,
        replays: (count: number) => count === 1 ? '1 gravação' : `${fmt.n(count)} gravações`,
        dayStarts: (timezone: string) => `O dia começa à meia-noite em ${timezone}.`,
        check: 'Verificar'
    },
    danger: {
        title: 'Zona de perigo',
        note: 'Excluir o app apaga seus eventos, sessões e gravações. Não é possível desfazer.',
        remove: 'Excluir o app',
        removeAction: 'Excluir',
        heading: (name: string) => `Excluir ${name}?`,
        removing: 'Excluindo…',
        warning: (host: string) => `Todos os dados de ${host} são apagados para sempre. O snippet instalado deixa de enviar eventos.`,
        confirm: (name: string) => `Digite ${name} para confirmar`
    }
};

export default pt;
