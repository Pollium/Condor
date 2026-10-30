import type es from '@/modules/overview/i18n/es';
import { fmt } from '@/shared/utils/format';

const pt: typeof es = {
    kpis: {
        sessions: 'Sessões',
        people: 'Pessoas',
        duration: 'Duração média',
        bounce: 'Taxa de rejeição',
        frustrated: 'Sessões frustradas',
        errors: 'Erros JS'
    },
    periods: {
        '24h': 'últimas 24 horas',
        '7d': 'últimos 7 dias',
        '30d': 'últimos 30 dias',
        '90d': 'últimos 90 dias'
    },
    noPrevious: 'Sem período anterior',
    noData: 'Sem dados neste período.',
    loaded: {
        failed: 'Não foi possível carregar.',
        retry: 'Tentar de novo'
    },
    channels: {
        direct: { label: 'Direto', detail: 'Digitam o endereço ou usam um favorito' },
        organic: { label: 'Busca orgânica', detail: 'Google, Bing, DuckDuckGo' },
        paid: { label: 'Pago', detail: 'Anúncios e links patrocinados' },
        social: { label: 'Redes sociais', detail: 'Instagram, TikTok, X' },
        messaging: { label: 'Mensagens', detail: 'WhatsApp, Telegram' },
        email: { label: 'E-mail', detail: 'Newsletters e e-mails' },
        ai: { label: 'Assistentes de IA', detail: 'ChatGPT, Perplexity, Gemini' },
        referral: { label: 'Referências', detail: 'Links de outros sites' }
    },
    devices: {
        desktop: 'Desktop',
        mobile: 'Celular',
        tablet: 'Tablet'
    },
    frustration: {
        rage: { label: 'Cliques de raiva', detail: '3+ cliques no mesmo ponto em menos de 1 s' },
        dead: { label: 'Cliques mortos', detail: 'Clique sem mudança na página nem na rede' },
        error: { label: 'Cliques com erro', detail: 'Um erro JS logo após o clique' },
        uturn: { label: 'Meia-volta', detail: 'Volta à página anterior em menos de 7 s' }
    },
    connections: {
        cellular: 'Dados móveis',
        slow2g: '2G lenta'
    },
    frequency: {
        once: '1 sessão',
        orMore: (count: string) => `${count} ou mais`,
        range: (range: string) => `${range} sessões`
    },
    releaseErrors: (share: string) => `${share} com erro`,
    places: {
        title: 'Onde estão',
        countries: 'Países',
        cities: 'Cidades',
        languages: 'Idiomas',
        outside: (country: string) => `Exceto ${country}`,
        outsideTop: 'Fora do país principal',
        vsPrevious: 'vs. o período anterior',
        groupBy: 'Agrupar por',
        byPlace: 'Sessões por local',
        noVisits: 'Sem visitas neste período.',
        showLess: 'Mostrar menos',
        showAll: (count: string) => `Mostrar tudo (${count})`
    },
    trends: {
        indicator: 'Indicador'
    },
    audience: {
        title: 'Público',
        returningTab: 'Recorrência',
        nowTab: 'Agora',
        returning: 'Recorrentes',
        fresh: 'Novas',
        visits: 'Quantas vezes vieram',
        connecting: 'Conectando…',
        liveNow: (count: number) => `${count === 1 ? 'pessoa' : 'pessoas'} no app agora`,
        livePages: 'Páginas com pessoas agora',
        nobody: 'Ninguém está navegando neste momento.'
    },
    technology: {
        title: 'Tecnologia',
        system: 'Sistema',
        systems: 'Sistemas operacionais',
        browser: 'Navegador',
        browsers: 'Navegadores',
        device: 'Dispositivo',
        devices: 'Dispositivos',
        screen: 'Tela',
        screens: 'Telas',
        network: 'Rede',
        connection: 'Conexão'
    },
    acquisition: {
        title: 'Aquisição',
        channels: 'Canais',
        sources: 'Origens',
        campaigns: 'Campanhas'
    },
    content: {
        title: 'Conteúdo',
        top: 'Mais vistas',
        topPages: 'Páginas mais vistas',
        entries: 'Entrada',
        entryPages: 'Páginas de entrada',
        exits: 'Saída',
        exitPages: 'Páginas de saída'
    },
    behaviour: {
        title: 'Comportamento',
        activeTime: 'Tempo ativo',
        scroll: 'Rolagem média',
        clicksPerSession: 'Cliques por sessão',
        sessionsPerPerson: 'Sessões por pessoa',
        duration: 'Duração',
        depth: 'Páginas',
        hours: 'Horário'
    },
    rhythm: {
        peak: 'Horário de pico',
        busiest: 'Dia mais ativo',
        night: 'À noite, 20–02 h',
        unit: 'sessões'
    },
    interaction: {
        title: 'Interação',
        customEvents: 'Eventos personalizados',
        people: (count: number) => `${fmt.n(count)} ${count === 1 ? 'pessoa' : 'pessoas'}`,
        frustration: 'Frustração',
        signals: 'Sinais de frustração'
    },
    performance: {
        title: 'Desempenho',
        releases: 'Versões',
        appReleases: 'Versões do app'
    },
    vitals: {
        lcp: 'Maior conteúdo visível',
        inp: 'Resposta à interação',
        cls: 'Estabilidade visual',
        fcp: 'Primeiro conteúdo',
        ttfb: 'Resposta do servidor',
        good: 'Bom',
        needsImprovement: 'Pode melhorar',
        poor: 'Ruim',
        empty: 'Ainda não há medições neste período.'
    },
    topIssues: {
        label: 'Erros abertos',
        empty: 'Nenhum erro aberto neste período.',
        sessions: (count: number) => `${fmt.n(count)} ${count === 1 ? 'sessão' : 'sessões'}`
    }
};

export default pt;
