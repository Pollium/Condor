import type es from '@/modules/journeys/i18n/es';
import { fmt } from '@/shared/utils/format';

const sessions = (count: number) => `${fmt.n(count)} ${count === 1 ? 'session' : 'sessions'}`;

const pages = (count: number) => `${fmt.n(count)} ${count === 1 ? 'page' : 'pages'}`;

const en: typeof es = {
    page: {
        steps: (count: number) => `${count} ${count === 1 ? 'step' : 'steps'}`,
        stepsLabel: 'Steps',
        withExits: 'With exits',
        withoutExits: 'Without exits',
        exitsLabel: 'Exits',
        from: (start: string) => `From ${start}`,
        loadFailed: 'Could not load the journeys',
        retry: 'Retry',
        loading: 'Tracing the sessions…',
        noneFrom: (start: string) => `No session starts at ${start}`,
        noneFromHint: 'Try another start page or a longer period.',
        emptyTitle: 'No journeys in this period yet',
        emptyHint: 'Once people browse your app, the path they take between pages shows up here.'
    },
    startPicker: {
        label: 'Start page',
        placeholder: 'From any page'
    },
    view: {
        sessions: 'Sessions',
        sessionCount: sessions,
        startsAt: (start: string) => `Starting at ${start}`,
        anyStart: 'With at least one page viewed',
        continued: 'Continue after the first step',
        leftFirst: (count: number) => `${sessions(count)} ${count === 1 ? 'leaves' : 'leave'} on the first page`,
        topRoute: 'Most common path',
        thenLeave: 'Then they leave',
        flow: 'Flow between pages',
        hover: 'Hover over a page or a band to see how many sessions take that path.',
        routes: 'Most common paths',
        noRoutes: 'No paths to show yet.',
        pages,
        pagesThenLeave: (count: number) => `${pages(count)}, then they leave`
    },
    nodes: {
        page: 'Page',
        other: 'Other pages',
        exit: 'Exit'
    },
    sankey: {
        label: 'Session flow between pages',
        entry: 'Entry',
        step: (step: number) => `Step ${step}`,
        ofColumn: 'Of the column',
        onward: 'Continue',
        ofSource: (label: string) => `Of ${label}`
    }
};

export default en;
