import type es from '@/modules/funnels/i18n/es';
import { fmt } from '@/shared/utils/format';

const pt: typeof es = {
    windows: {
        hours: (hours: number) => `Em ${hours} h`,
        days: (days: number) => days === 1 ? 'Em 1 dia' : `Em ${days} dias`
    },
    devices: {
        desktop: 'Desktop',
        mobile: 'Celular',
        tablet: 'Tablet'
    },
    days: (days: string) => `${days} dias`,
    sameAsBefore: 'Igual a antes',
    pointsVsBefore: (points: string) => `${points} pts vs. antes`,
    page: {
        loadFailed: 'Não foi possível carregar os funis',
        retry: 'Tentar novamente',
        loading: 'Carregando funis…',
        emptyTitle: 'Ainda não há funis',
        emptyHint: 'Um funil acompanha as pessoas por uma série de etapas, páginas que visitam ou eventos que seu app envia, e mostra quantas chegam a cada uma e onde param.',
        createFirst: 'Criar o primeiro funil',
        steps: (count: number) => count === 1 ? '1 etapa' : `${fmt.n(count)} etapas`,
        funnel: 'Funil',
        window: 'Janela de conversão',
        create: 'Novo funil',
        edit: 'Editar funil',
        remove: 'Excluir funil'
    },
    results: {
        failed: 'Não foi possível calcular o funil',
        retry: 'Tentar novamente',
        loading: 'Calculando o funil…',
        emptyTitle: 'Ninguém começa este funil no período',
        emptyHint: 'Tente um período mais longo, ou confira se a primeira etapa corresponde a uma página ou a um evento que seu app envia.',
        chart: 'Pessoas em cada etapa'
    },
    stats: {
        conversion: 'Conversão total',
        complete: 'Concluem',
        ofStarting: (count: number) => count === 1 ? 'de 1 que começa' : `de ${fmt.n(count)} que começam`,
        medianTime: 'Tempo mediano',
        firstToLast: 'Da primeira etapa à última',
        biggestDrop: 'Maior abandono',
        before: (step: string) => `Antes de “${step}”`,
        noneYet: 'Ninguém começa ainda'
    },
    chart: {
        start: 'Início',
        continued: (share: string) => `${share} continuam`,
        reach: 'Chegam',
        fromStart: 'Desde o início',
        dropOff: 'Abandonam'
    },
    breakdown: {
        steps: 'Etapas',
        stepsLabel: 'Etapas do funil',
        stepDetail: (match: string, dropped: number, median: string) =>
            `${match} · ${fmt.n(dropped)} ${dropped === 1 ? 'abandona' : 'abandonam'} · mediana ${median}`,
        start: 'Início',
        ofPrevious: (share: string) => `${share} da anterior`,
        devices: 'Conversão por dispositivo',
        noDevices: 'Ninguém entra no funil neste período ainda.',
        deviceDetail: (entered: number, reached: number, step: string) =>
            `${fmt.n(entered)} ${entered === 1 ? 'entra' : 'entram'} · ${fmt.n(reached)} ${reached === 1 ? 'chega' : 'chegam'} a “${step}”`
    },
    editor: {
        create: 'Novo funil',
        edit: 'Editar funil',
        save: 'Salvar',
        saving: 'Salvando…',
        cancel: 'Cancelar',
        intro: 'Conta as pessoas que fazem cada etapa em ordem, dentro da janela a partir da primeira.',
        name: 'Nome',
        namePlaceholder: 'Compra',
        window: 'Janela de conversão',
        maxSteps: (count: number) => `Até ${count} etapas`,
        addStep: 'Adicionar etapa'
    },
    stepField: {
        kinds: {
            page: 'Página',
            event: 'Evento'
        },
        step: (index: number) => `Etapa ${index}`,
        kindOf: (index: number) => `Tipo da etapa ${index}`,
        remove: 'Remover etapa',
        pageHelper: 'Um caminho; :parâmetro vale qualquer valor',
        eventHelper: 'O nome que seu app envia',
        pagePlaceholder: '/produtos/:slug',
        label: 'Nome da etapa',
        labelHelper: 'Opcional; se ficar vazio, usa a página ou o evento',
        labelPlaceholder: 'Vê um produto',
        whereKey: 'Só se a propriedade',
        whereKeyHelper: 'Opcional; por exemplo plan',
        whereValue: 'for igual a',
        whereValueHelper: 'O valor exato que seu app envia'
    },
    deleteDialog: {
        heading: (name: string) => `Excluir “${name}”?`,
        confirm: 'Excluir',
        deleting: 'Excluindo…',
        cancel: 'Cancelar',
        body: 'Ele some para toda a equipe. As sessões e os eventos não mudam.'
    },
    errors: {
        notFound: 'Este funil não existe mais.'
    }
};

export default pt;
