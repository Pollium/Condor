import type es from '@/modules/sessions/i18n/es';
import { fmt } from '@/shared/utils/format';

const count = (value: number, one: string, many: string) => `${fmt.n(value)} ${value === 1 ? one : many}`;

const en: typeof es = {
    devices: {
        desktop: 'Desktop',
        mobile: 'Mobile',
        tablet: 'Tablet'
    },
    allDevices: 'All devices',
    channels: {
        direct: 'Direct',
        organic: 'Search',
        paid: 'Ads',
        social: 'Social media',
        messaging: 'Messaging',
        email: 'Email',
        ai: 'AI assistants',
        referral: 'Other sites'
    },
    flags: {
        error: 'With errors',
        rage: 'With rage clicks',
        dead: 'With dead clicks',
        uturn: 'With U-turns',
        converted: 'Converted',
        identified: 'Identified',
        replay: 'With recording'
    },
    sorts: {
        recent: 'Most recent',
        longest: 'Longest',
        events: 'Most events',
        frustrated: 'Most frustrated'
    },
    anonymous: 'Anonymous person',
    live: 'Live',
    pages: (value: number) => count(value, 'page', 'pages'),
    counts: {
        errors: (value: number) => count(value, 'error', 'errors'),
        rage: (value: number) => count(value, 'rage click', 'rage clicks'),
        dead: (value: number) => count(value, 'dead click', 'dead clicks'),
        uturns: (value: number) => count(value, 'U-turn', 'U-turns')
    },
    list: {
        loadFailed: 'Could not load the sessions',
        retry: 'Retry',
        loading: 'Loading sessions…',
        only: (country: string | null, person: boolean) =>
            `Only sessions ${[country && `from ${country}`, person && 'from one person'].filter(Boolean).join(' and ')}`,
        seeAll: 'See all',
        hint: 'Click to play. With a session focused, Space opens a quick look.',
        previousPage: 'Previous page',
        nextPage: 'Next page',
        perPage: 'Per page',
        page: 'Page',
        range: (min: number, max: number, total: number) => `${fmt.n(min)}–${fmt.n(max)} of ${fmt.n(total)}`,
        ofPages: (pages: number) => `of ${count(pages, 'page', 'pages')}`
    },
    toolbar: {
        total: (value: number) => count(value, 'session', 'sessions'),
        searchLabel: 'Search sessions',
        searchPlaceholder: 'Person, email or page',
        clearSearch: 'Clear',
        sort: 'Sort',
        device: 'Device',
        filters: 'Filters'
    },
    sessionList: {
        rage: 'Rage clicks',
        dead: 'Dead clicks',
        converted: 'Converted',
        noReplay: 'No recording',
        at: (path: string) => `on ${path}`,
        noMatch: 'No sessions match',
        noMatchHint: 'Remove a filter or search for something else.',
        empty: 'No sessions yet',
        emptyHint: 'Sessions show up here as soon as the site sends its first event.'
    },
    quickLook: {
        open: 'Open session'
    },
    session: {
        title: 'Session',
        openFailed: 'Could not open the session',
        copyLink: 'Copy link',
        linkCopied: 'Link copied'
    },
    stats: {
        duration: 'Duration',
        active: (duration: string) => `${duration} active`,
        pages: 'Pages',
        exitsOn: (path: string) => `exits on ${path}`,
        events: 'Events',
        converted: 'Converted',
        notConverted: 'No conversion',
        friction: 'Friction',
        noSignals: 'No signals'
    },
    replay: {
        loading: 'Loading the recording…',
        missing: 'This session has no recording',
        missingHint: 'Recording was turned off or the page did not allow it. The events and the person details are still available.',
        failed: 'Could not load the recording',
        failedHint: 'The events and the person details are still available. Try again in a moment.',
        skipping: 'Skipping an idle stretch'
    },
    controls: {
        position: 'Position',
        play: 'Play',
        pause: 'Pause',
        back: 'Back 10 seconds',
        forward: 'Forward 10 seconds',
        speed: 'Speed',
        options: 'Replay options',
        skipInactive: 'Skip inactivity',
        skipInactiveHint: 'Fast-forwards through stretches with no movement'
    },
    panel: {
        label: 'Session details',
        events: 'Events',
        console: 'Console',
        network: 'Network',
        person: 'Person'
    },
    timeline: {
        label: 'Session events',
        empty: 'No events',
        emptyHint: 'This session recorded no pages, clicks or errors.',
        opens: (path: string) => `Opens ${path}`,
        click: 'Click',
        rageClick: 'Rage click',
        deadClick: 'Dead click',
        clickOn: (kind: string, text: string) => `${kind} on “${text}”`,
        error: 'Error',
        identifies: 'Identifies',
        event: 'Event',
        metric: 'Metric',
        ratings: {
            good: 'Good',
            needsImprovement: 'Needs improvement',
            poor: 'Poor'
        }
    },
    console: {
        empty: 'Empty console',
        emptyHint: 'The recording captured no console messages.'
    },
    network: {
        failed: 'Failed',
        empty: 'No requests',
        emptyHint: 'The recording captured no network requests.'
    },
    person: {
        name: 'Name',
        email: 'Email',
        userId: 'User ID',
        place: 'Location',
        device: 'Device',
        os: 'OS',
        browser: 'Browser',
        language: 'Language',
        timezone: 'Time zone',
        connection: 'Connection',
        channel: 'Channel',
        referrer: 'Came from',
        campaign: 'Campaign',
        release: 'Version',
        firstSeen: 'First seen',
        anonymousId: 'Identifier',
        others: 'Other sessions',
        seeAll: 'See all',
        recorded: 'Recorded'
    },
    errors: {
        notFound: 'This session no longer exists or belongs to another app.'
    }
};

export default en;
