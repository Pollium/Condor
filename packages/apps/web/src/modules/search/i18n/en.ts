import type es from '@/modules/search/i18n/es';
import { fmt } from '@/shared/utils/format';

const en: typeof es = {
    title: 'Search',
    label: 'Search in Condor',
    placeholder: 'People, errors, pages, apps or views',
    clear: 'Clear',
    searching: 'Searching…',
    noMatch: (query: string) => `Nothing matches “${query}”.`,
    people: 'People',
    anonymous: 'Anonymous',
    sessions: (count: number) => count === 1 ? '1 session' : `${fmt.n(count)} sessions`,
    issues: 'Errors',
    pages: 'Pages',
    views: (count: number) => count === 1 ? '1 view' : `${fmt.n(count)} views`,
    apps: 'Apps',
    goTo: 'Go to'
};

export default en;
