import type es from '@/app/i18n/es';

const pt: typeof es = {
    periods: {
        '24h': 'Últimas 24 horas',
        '7d': 'Últimos 7 dias',
        '30d': 'Últimos 30 dias',
        '90d': 'Últimos 90 dias'
    },
    period: 'Período',
    skipToContent: 'Ir para o conteúdo',
    openMenu: 'Abrir o menu',
    closeMenu: 'Fechar o menu',
    switchApp: 'Trocar de app',
    chooseApp: 'Escolha um app',
    addApp: 'Adicionar um app',
    addAppEllipsis: 'Adicionar um app…',
    liveNow: (count: number, app: string) => `${count} ${count === 1 ? 'pessoa' : 'pessoas'} em ${app} agora`,
    live: (count: number) => `${count} ao vivo`,
    search: 'Buscar',
    lightTheme: 'Usar o tema claro',
    darkTheme: 'Usar o tema escuro',
    account: 'Conta',
    yourAccount: 'Sua conta',
    team: 'Equipe',
    signOut: 'Sair',
    navigation: 'Navegação',
    settings: 'Configurações'
};

export default pt;
