import { fmt } from '@/shared/utils/format';

const count = (value: number, one: string, many: string) => `${fmt.n(value)} ${value === 1 ? one : many}`;

export default {
    modes: {
        clicks: 'Clics',
        rage: 'Clics de rabia',
        scroll: 'Scroll'
    },
    widths: {
        desktop: 'Escritorio',
        tablet: 'Tablet',
        mobile: 'Móvil'
    },
    page: {
        hint: (views: number, clicks: number) => `${count(views, 'vista', 'vistas')} · ${count(clicks, 'clic', 'clics')}`,
        path: 'Página',
        mode: 'Modo',
        width: 'Ancho',
        emptyTitle: 'Aún no hay clics que dibujar',
        emptyDescription: 'Cuando las personas visiten tu app y hagan clic, cada página tendrá aquí su mapa de calor.'
    },
    frame: {
        noSnapshot: 'Aún no hay una grabación de esta página para dibujarla',
        snapshotFailed: 'No se pudo reconstruir la grabación de esta página',
        half: 'La mitad llega hasta aquí'
    },
    panel: {
        sessions: 'Sesiones analizadas',
        clicks: 'Clics',
        rageClicks: 'Clics de rabia',
        perSession: (clicks: number, perSession: number) => `${fmt.n(clicks)} · ${fmt.n(perSession)} por sesión`,
        averageScroll: 'Scroll medio',
        reach: 'Hasta dónde llegan',
        top: 'Arriba',
        depth: (depth: number) => `${depth} %`,
        reached: (depth: number) => `Llegan al ${depth} %`,
        few: 'Pocos',
        many: 'Muchos',
        frustration: 'Dónde se frustran',
        mostClicked: 'Más clics',
        rageElements: 'Elementos con clics de rabia',
        clickedElements: 'Elementos con más clics',
        noRageTitle: 'Nadie se frustró aquí',
        noRageDescription: 'Ningún elemento recibió clics repetidos en este periodo.',
        noClicksTitle: 'Aún no hay clics',
        noClicksDescription: 'Cuando alguien haga clic en esta página aparecerá aquí.'
    }
};
