import type es from '@/modules/events/i18n/es';
import { fmt } from '@/shared/utils/format';

const en: typeof es = {
    page: {
        count: (count: number) => count === 1 ? '1 custom event in this period' : `${fmt.n(count)} custom events in this period`,
        list: 'Custom events',
        emptyTitle: 'No custom events yet',
        emptyHint: 'Call condor.track("name", { ... }) from your app or send them from your server, and they will show up here.'
    },
    detail: {
        noPrevious: 'no data for the previous period',
        vsPrevious: (change: string) => `${change} vs. the previous period`,
        times: 'Times',
        people: 'People',
        perPerson: 'Per person',
        overTime: 'Over time',
        properties: 'Properties',
        property: 'Property',
        noProperties: 'This event arrives without properties.',
        counting: 'Counting the values…',
        valuesOf: (key: string) => `Values of ${key}`
    },
    segment: {
        label: 'People',
        everyone: 'Everyone'
    }
};

export default en;
