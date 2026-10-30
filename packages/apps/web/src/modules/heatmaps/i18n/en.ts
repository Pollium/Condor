import type es from '@/modules/heatmaps/i18n/es';
import { fmt } from '@/shared/utils/format';

const count = (value: number, one: string, many: string) => `${fmt.n(value)} ${value === 1 ? one : many}`;

const en: typeof es = {
    modes: {
        clicks: 'Clicks',
        rage: 'Rage clicks',
        scroll: 'Scroll'
    },
    widths: {
        desktop: 'Desktop',
        tablet: 'Tablet',
        mobile: 'Mobile'
    },
    page: {
        hint: (views: number, clicks: number) => `${count(views, 'view', 'views')} · ${count(clicks, 'click', 'clicks')}`,
        path: 'Page',
        mode: 'Mode',
        width: 'Width',
        emptyTitle: 'No clicks to draw yet',
        emptyDescription: 'Once people visit your app and click, each page gets its heatmap here.'
    },
    frame: {
        noSnapshot: 'No recording of this page to draw it on yet',
        snapshotFailed: 'Could not rebuild the recording of this page',
        half: 'Half get this far'
    },
    panel: {
        sessions: 'Sessions analyzed',
        clicks: 'Clicks',
        rageClicks: 'Rage clicks',
        perSession: (clicks: number, perSession: number) => `${fmt.n(clicks)} · ${fmt.n(perSession)} per session`,
        averageScroll: 'Average scroll',
        reach: 'How far they scroll',
        top: 'Top',
        depth: (depth: number) => `${depth}%`,
        reached: (depth: number) => `Reach ${depth}%`,
        few: 'Few',
        many: 'Many',
        frustration: 'Where they get frustrated',
        mostClicked: 'Most clicked',
        rageElements: 'Elements with rage clicks',
        clickedElements: 'Most clicked elements',
        noRageTitle: 'No one got frustrated here',
        noRageDescription: 'No element got repeated clicks in this period.',
        noClicksTitle: 'No clicks yet',
        noClicksDescription: 'When someone clicks on this page, it shows up here.'
    }
};

export default en;
