import type es from '@/modules/heatmaps/i18n/es';
import { fmt } from '@/shared/utils/format';

const count = (value: number, one: string, many: string) => `${fmt.n(value)} ${value === 1 ? one : many}`;

const pt: typeof es = {
    modes: {
        clicks: 'Cliques',
        rage: 'Cliques de raiva',
        scroll: 'Rolagem'
    },
    widths: {
        desktop: 'Desktop',
        tablet: 'Tablet',
        mobile: 'Celular'
    },
    page: {
        hint: (views: number, clicks: number) => `${count(views, 'visualização', 'visualizações')} · ${count(clicks, 'clique', 'cliques')}`,
        path: 'Página',
        mode: 'Modo',
        width: 'Largura',
        emptyTitle: 'Ainda não há cliques para desenhar',
        emptyDescription: 'Quando as pessoas visitarem seu app e clicarem, cada página terá aqui o seu mapa de calor.'
    },
    frame: {
        noSnapshot: 'Ainda não há uma gravação desta página para desenhá-la',
        snapshotFailed: 'Não foi possível reconstruir a gravação desta página',
        half: 'Metade chega até aqui'
    },
    panel: {
        sessions: 'Sessões analisadas',
        clicks: 'Cliques',
        rageClicks: 'Cliques de raiva',
        perSession: (clicks: number, perSession: number) => `${fmt.n(clicks)} · ${fmt.n(perSession)} por sessão`,
        averageScroll: 'Rolagem média',
        reach: 'Até onde chegam',
        top: 'Topo',
        depth: (depth: number) => `${depth}%`,
        reached: (depth: number) => `Chegam a ${depth}%`,
        few: 'Poucos',
        many: 'Muitos',
        frustration: 'Onde se frustram',
        mostClicked: 'Mais clicados',
        rageElements: 'Elementos com cliques de raiva',
        clickedElements: 'Elementos mais clicados',
        noRageTitle: 'Ninguém se frustrou aqui',
        noRageDescription: 'Nenhum elemento recebeu cliques repetidos neste período.',
        noClicksTitle: 'Ainda não há cliques',
        noClicksDescription: 'Quando alguém clicar nesta página, aparecerá aqui.'
    }
};

export default pt;
