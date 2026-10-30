import type es from '@/shared/i18n/es';

const en: typeof es = {
    views: {
        overview: 'Overview',
        sessions: 'Sessions',
        events: 'Events',
        heatmaps: 'Heatmaps',
        funnels: 'Funnels',
        journeys: 'Journeys',
        retention: 'Retention',
        issues: 'Errors',
        settings: 'App settings'
    },
    actionsOf: (subject: string) => `Actions for ${subject}`,
    backTo: (label: string) => `Back to ${label}`,
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied',
    worldMap: 'Map of people by country',
    chart: {
        sessions: 'Sessions',
        errored: 'With errors',
        quiet: 'Quiet',
        peak: 'Peak'
    },
    carbon: {
        'open.menu': 'Open menu',
        'close.menu': 'Close menu',
        'clear.all': 'Clear all',
        'clear.selection': 'Clear selection'
    },
    errors: {
        forbidden: 'Your role does not allow this.',
        unauthorized: 'Your session ended. Sign in again.',
        tooManyRequests: 'Too many attempts. Wait a moment and try again.',
        validationFailed: 'Check the highlighted fields.',
        projectNotFound: 'This app no longer exists.',
        offline: 'Cannot reach Condor. Check that its services are running.',
        unknown: 'Something went wrong. Try again.'
    }
};

export default en;
