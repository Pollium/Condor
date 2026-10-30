import type es from '@/modules/issues/i18n/es';
import { fmt } from '@/shared/utils/format';

const en: typeof es = {
    page: {
        hint: (open: number, sessions: number) => `${fmt.n(open)} unresolved · ${sessions === 1 ? '1 affected session' : `${fmt.n(sessions)} affected sessions`}`,
        searchLabel: 'Search errors',
        searchPlaceholder: 'Search',
        clearSearch: 'Clear the search',
        status: 'Status',
        grouped: 'Grouped errors',
        noMatch: 'No errors match',
        noMatchHint: 'Try another status or search for something else.',
        empty: 'No errors in this period',
        emptyHint: 'When your app throws an exception it shows up here, grouped with others of the same type.'
    },
    filters: {
        all: 'All',
        open: 'Unresolved',
        resolved: 'Resolved',
        ignored: 'Ignored'
    },
    states: {
        new: 'New',
        open: 'Open',
        regressed: 'Regressed',
        resolved: 'Resolved',
        ignored: 'Ignored'
    },
    sessions: (count: number) => count === 1 ? '1 session' : `${fmt.n(count)} sessions`,
    detail: {
        occurrences: 'Occurrences',
        sessions: 'Sessions',
        people: 'People',
        since: 'Since',
        lastSeen: (ago: string) => `Last seen ${ago}`,
        lastDay: 'Last 24 hours',
        trace: 'Stack trace'
    },
    actions: {
        viewSession: 'View a session',
        more: 'More actions',
        resolve: 'Resolve',
        ignore: 'Ignore',
        reopen: 'Reopen'
    },
    errors: {
        notFound: 'This error no longer exists.'
    }
};

export default en;
