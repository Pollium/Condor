import type es from '@/modules/funnels/i18n/es';
import { fmt } from '@/shared/utils/format';

const en: typeof es = {
    windows: {
        hours: (hours: number) => `Within ${hours} h`,
        days: (days: number) => days === 1 ? 'Within 1 day' : `Within ${days} days`
    },
    devices: {
        desktop: 'Desktop',
        mobile: 'Mobile',
        tablet: 'Tablet'
    },
    days: (days: string) => `${days} days`,
    sameAsBefore: 'Same as before',
    pointsVsBefore: (points: string) => `${points} pts vs. before`,
    page: {
        loadFailed: 'Could not load the funnels',
        retry: 'Retry',
        loading: 'Loading funnels…',
        emptyTitle: 'No funnels yet',
        emptyHint: 'A funnel follows people through a series of steps, pages they visit or events your app sends, and shows how many reach each one and where they stop.',
        createFirst: 'Create the first funnel',
        steps: (count: number) => count === 1 ? '1 step' : `${fmt.n(count)} steps`,
        funnel: 'Funnel',
        window: 'Conversion window',
        create: 'New funnel',
        edit: 'Edit funnel',
        remove: 'Delete funnel'
    },
    results: {
        failed: 'Could not calculate the funnel',
        retry: 'Retry',
        loading: 'Calculating the funnel…',
        emptyTitle: 'No one starts this funnel in the period',
        emptyHint: 'Try a longer period, or check that the first step matches a page or an event your app sends.',
        chart: 'People at each step'
    },
    stats: {
        conversion: 'Overall conversion',
        complete: 'Complete',
        ofStarting: (count: number) => count === 1 ? 'of 1 who starts' : `of ${fmt.n(count)} who start`,
        medianTime: 'Median time',
        firstToLast: 'From the first step to the last',
        biggestDrop: 'Biggest drop-off',
        before: (step: string) => `Before “${step}”`,
        noneYet: 'No one starts yet'
    },
    chart: {
        start: 'Start',
        continued: (share: string) => `${share} continue`,
        reach: 'Reach',
        fromStart: 'From the start',
        dropOff: 'Drop off'
    },
    breakdown: {
        steps: 'Steps',
        stepsLabel: 'Funnel steps',
        stepDetail: (match: string, dropped: number, median: string) =>
            `${match} · ${fmt.n(dropped)} ${dropped === 1 ? 'drops off' : 'drop off'} · median ${median}`,
        start: 'Start',
        ofPrevious: (share: string) => `${share} of the previous`,
        devices: 'Conversion by device',
        noDevices: 'No one enters the funnel in this period yet.',
        deviceDetail: (entered: number, reached: number, step: string) =>
            `${fmt.n(entered)} ${entered === 1 ? 'enters' : 'enter'} · ${fmt.n(reached)} ${reached === 1 ? 'reaches' : 'reach'} “${step}”`
    },
    editor: {
        create: 'New funnel',
        edit: 'Edit funnel',
        save: 'Save',
        saving: 'Saving…',
        cancel: 'Cancel',
        intro: 'Counts the people who do each step in order, within the window from the first one.',
        name: 'Name',
        namePlaceholder: 'Purchase',
        window: 'Conversion window',
        maxSteps: (count: number) => `Up to ${count} steps`,
        addStep: 'Add step'
    },
    stepField: {
        kinds: {
            page: 'Page',
            event: 'Event'
        },
        step: (index: number) => `Step ${index}`,
        kindOf: (index: number) => `Step ${index} type`,
        remove: 'Remove step',
        pageHelper: 'A path; :param matches any value',
        eventHelper: 'The name your app sends',
        pagePlaceholder: '/products/:slug',
        label: 'Step name',
        labelHelper: 'Optional; if left empty, the page or event is used',
        labelPlaceholder: 'Views a product',
        whereKey: 'Only if the property',
        whereKeyHelper: 'Optional; for example plan',
        whereValue: 'equals',
        whereValueHelper: 'The exact value your app sends'
    },
    deleteDialog: {
        heading: (name: string) => `Delete “${name}”?`,
        confirm: 'Delete',
        deleting: 'Deleting…',
        cancel: 'Cancel',
        body: 'It disappears for the whole team. Sessions and events stay as they are.'
    },
    errors: {
        notFound: 'This funnel no longer exists.'
    }
};

export default en;
