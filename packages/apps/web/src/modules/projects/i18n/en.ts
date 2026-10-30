import type es from '@/modules/projects/i18n/es';
import { fmt } from '@/shared/utils/format';

const en: typeof es = {
    cancel: 'Cancel',
    platforms: {
        web: 'Web',
        server: 'Server or HTTP API'
    },
    home: {
        loading: 'Loading your apps…',
        hint: 'No apps yet',
        title: 'Connect your first app',
        description: 'Each app has its own key. Install the SDK with one line and sessions, metrics and errors start coming in.',
        add: 'Add an app'
    },
    addApp: {
        title: 'Add an app',
        source: 'Where it sends data from',
        platform: 'Platform',
        name: 'Name',
        domain: 'Domain',
        serviceHost: 'Service host',
        domainHelper: 'Visits from this domain do not count as external referrers.',
        serviceHelper: 'Only used to tell it apart in the app list.',
        create: 'Create app'
    },
    connect: {
        hint: (platform: string) => `${platform} · waiting for the first event`,
        title: (name: string) => `Connect ${name}`,
        webLead: 'Install the SDK and metrics and recordings start arriving on their own.',
        serverLead: 'Send events from your backend with an HTTP request.',
        installStep: 'Install the SDK',
        sendStep: 'Send an event',
        identifyStep: 'Identify people',
        optional: 'Optional',
        firstEvent: 'First event',
        httpStep: 'Send events over HTTP',
        install: 'Installation',
        httpNote: 'Any language works: it is a POST with your public key.',
        scriptNote: 'Paste this before </head> on every page.',
        npmNote: 'Initialize it once when your app starts.',
        identifyNote: 'That way every session carries a name and you can search for it by email.',
        testFailed: 'The test event did not arrive',
        testFailedHint: 'Check that the collector is running and that this console can reach it at /i.',
        waiting: (host: string) => `Waiting for data from ${host}…`,
        sending: 'Sending…',
        sendTest: 'Send a test event'
    },
    settings: {
        title: 'Settings',
        readOnly: 'Your role is read-only.'
    },
    save: {
        saving: 'Saving…',
        saved: 'Saved',
        failed: 'Not saved'
    },
    install: {
        title: 'Installation',
        notes: {
            script: 'Paste the snippet before </head> on every page.',
            npm: 'Initialize the SDK once when your app starts.',
            http: 'Any language works: it is a POST with the public key.'
        },
        publicKey: 'Public key',
        keyCopied: 'Copied',
        snippet: 'Install snippet',
        showCode: 'Show the code',
        variant: 'Variant',
        rotate: 'Rotate the key',
        rotateDetail: 'The current key stops working instantly.',
        rotateAction: 'Rotate'
    },
    rotateKey: {
        heading: 'Rotate the public key?',
        confirm: 'Rotate the key',
        rotating: 'Rotating…',
        lead: (name: string) => `${name} will get a new key. The current one, `,
        tail: ', stops working as soon as you confirm: events and recordings that use it are rejected.',
        update: 'Update the snippet on your site or backend right after.'
    },
    app: {
        title: 'App',
        note: 'The time zone decides where each day starts in the charts and in the status below.',
        name: 'Name',
        domain: 'Domain',
        color: 'Color',
        timezone: 'Time zone'
    },
    privacy: {
        title: 'Privacy',
        note: 'Hidden content shows up in the replay as an empty block of the same size. With “Do Not Track” on in the browser, nothing is sent.',
        maskInputs: 'Hide what people type',
        maskText: 'Hide all text',
        respectDnt: 'Respect “Do Not Track”',
        blockSelector: 'Never record these elements'
    },
    recording: {
        title: 'Recording',
        note: 'Metrics count every session; only recordings follow the sample. When the period ends, events and recordings are deleted.',
        enabled: 'Record sessions',
        sample: 'Sessions recorded',
        percent: (value: number) => `${value}%`,
        keepFor: 'Keep for',
        days: (count: number) => count === 1 ? '1 day' : `${fmt.n(count)} days`,
        years: (count: number) => count === 1 ? '1 year' : `${fmt.n(count)} years`
    },
    capture: {
        title: 'Network and console',
        note: 'Authorization and Cookie are never stored. Requests and the console show up next to the replay.',
        network: 'Capture network requests',
        console: 'Capture the console'
    },
    routes: {
        title: 'Group paths',
        param: ':name',
        paramNote: ' replaces one segment and ',
        restNote: ' everything after it. So /products/sneaker and /products/shirt count as /products/:slug.',
        remove: (pattern: string) => `Remove ${pattern}`,
        empty: 'Each path is counted on its own.',
        pattern: 'New pattern',
        placeholder: '/products/:slug',
        invalid: 'Start with /',
        add: 'Add'
    },
    conversion: {
        title: 'Conversion',
        note: 'A session counts as converted when it sends this event. Pick one seen in the last 90 days or type another; leave it empty and none is marked.',
        event: 'Event that marks a conversion',
        none: 'None'
    },
    status: {
        title: 'Status',
        checking: 'Checking…',
        noEvents: 'No events have arrived yet',
        lastEvent: (ago: string) => `Last event ${ago}`,
        today: (summary: string) => `Today: ${summary}`,
        events: (count: number) => count === 1 ? '1 event' : `${fmt.n(count)} events`,
        sessions: (count: number) => count === 1 ? '1 session' : `${fmt.n(count)} sessions`,
        replays: (count: number) => count === 1 ? '1 recording' : `${fmt.n(count)} recordings`,
        dayStarts: (timezone: string) => `The day starts at midnight in ${timezone}.`,
        check: 'Check'
    },
    danger: {
        title: 'Danger zone',
        note: 'Deleting the app erases its events, sessions and recordings. This cannot be undone.',
        remove: 'Delete the app',
        removeAction: 'Delete',
        heading: (name: string) => `Delete ${name}?`,
        removing: 'Deleting…',
        warning: (host: string) => `All data from ${host} is erased for good. The installed snippet stops sending events.`,
        confirm: (name: string) => `Type ${name} to confirm`
    }
};

export default en;
