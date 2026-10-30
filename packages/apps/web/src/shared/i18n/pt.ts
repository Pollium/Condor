import type es from '@/shared/i18n/es';

const pt: typeof es = {
    views: {
        overview: 'Resumo',
        sessions: 'Sessões',
        events: 'Eventos',
        heatmaps: 'Mapas de calor',
        funnels: 'Funis',
        journeys: 'Jornadas',
        retention: 'Retenção',
        issues: 'Erros',
        settings: 'Configurações do app'
    },
    actionsOf: (subject: string) => `Ações de ${subject}`,
    backTo: (label: string) => `Voltar para ${label}`,
    close: 'Fechar',
    copy: 'Copiar',
    copied: 'Copiado',
    worldMap: 'Mapa de pessoas por país',
    chart: {
        sessions: 'Sessões',
        errored: 'Com erro',
        quiet: 'Tranquilo',
        peak: 'Pico'
    },
    carbon: {
        'open.menu': 'Abrir menu',
        'close.menu': 'Fechar menu',
        'clear.all': 'Limpar tudo',
        'clear.selection': 'Limpar seleção'
    },
    errors: {
        forbidden: 'Sua função não permite fazer isso.',
        unauthorized: 'Sua sessão terminou. Entre novamente.',
        tooManyRequests: 'Muitas tentativas. Espere um momento e tente de novo.',
        validationFailed: 'Revise os campos destacados.',
        projectNotFound: 'Este app não existe mais.',
        offline: 'Sem conexão com o Condor. Verifique se os serviços estão em execução.',
        unknown: 'Algo deu errado. Tente novamente.'
    }
};

export default pt;
