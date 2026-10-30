import type es from '@/modules/overview/i18n/es';
import { fmt } from '@/shared/utils/format';

const en: typeof es = {
    kpis: {
        sessions: 'Sessions',
        people: 'People',
        duration: 'Average duration',
        bounce: 'Bounce rate',
        frustrated: 'Frustrated sessions',
        errors: 'JS errors'
    },
    periods: {
        '24h': 'last 24 hours',
        '7d': 'last 7 days',
        '30d': 'last 30 days',
        '90d': 'last 90 days'
    },
    noPrevious: 'No previous period',
    noData: 'No data in this period.',
    loaded: {
        failed: 'Could not load.',
        retry: 'Retry'
    },
    channels: {
        direct: { label: 'Direct', detail: 'Typed the address or used a bookmark' },
        organic: { label: 'Organic search', detail: 'Google, Bing, DuckDuckGo' },
        paid: { label: 'Paid', detail: 'Ads and sponsored links' },
        social: { label: 'Social media', detail: 'Instagram, TikTok, X' },
        messaging: { label: 'Messaging', detail: 'WhatsApp, Telegram' },
        email: { label: 'Email', detail: 'Newsletters and emails' },
        ai: { label: 'AI assistants', detail: 'ChatGPT, Perplexity, Gemini' },
        referral: { label: 'Referrals', detail: 'Links from other sites' }
    },
    devices: {
        desktop: 'Desktop',
        mobile: 'Mobile',
        tablet: 'Tablet'
    },
    frustration: {
        rage: { label: 'Rage clicks', detail: '3+ clicks on the same spot in under 1 s' },
        dead: { label: 'Dead clicks', detail: 'A click with no page or network change' },
        error: { label: 'Error clicks', detail: 'A JS error right after the click' },
        uturn: { label: 'U-turns', detail: 'Goes back to the previous page within 7 s' }
    },
    connections: {
        cellular: 'Cellular',
        slow2g: 'Slow 2G'
    },
    frequency: {
        once: '1 session',
        orMore: (count: string) => `${count} or more`,
        range: (range: string) => `${range} sessions`
    },
    releaseErrors: (share: string) => `${share} with errors`,
    places: {
        title: 'Where they are',
        countries: 'Countries',
        cities: 'Cities',
        languages: 'Languages',
        outside: (country: string) => `Outside ${country}`,
        outsideTop: 'Outside the top country',
        vsPrevious: 'vs. the previous period',
        groupBy: 'Group by',
        byPlace: 'Sessions by place',
        noVisits: 'No visits in this period.',
        showLess: 'Show less',
        showAll: (count: string) => `Show all ${count}`
    },
    trends: {
        indicator: 'Metric'
    },
    audience: {
        title: 'Audience',
        returningTab: 'Returning',
        nowTab: 'Now',
        returning: 'Returning',
        fresh: 'New',
        visits: 'How many times they came',
        connecting: 'Connecting…',
        liveNow: (count: number) => count === 1 ? 'person in the app now' : 'people in the app now',
        livePages: 'Pages with people now',
        nobody: 'Nobody is browsing right now.'
    },
    technology: {
        title: 'Technology',
        system: 'OS',
        systems: 'Operating systems',
        browser: 'Browser',
        browsers: 'Browsers',
        device: 'Device',
        devices: 'Devices',
        screen: 'Screen',
        screens: 'Screens',
        network: 'Network',
        connection: 'Connection'
    },
    acquisition: {
        title: 'Acquisition',
        channels: 'Channels',
        sources: 'Sources',
        campaigns: 'Campaigns'
    },
    content: {
        title: 'Content',
        top: 'Most viewed',
        topPages: 'Most viewed pages',
        entries: 'Entry',
        entryPages: 'Entry pages',
        exits: 'Exit',
        exitPages: 'Exit pages'
    },
    behaviour: {
        title: 'Behavior',
        activeTime: 'Active time',
        scroll: 'Average scroll',
        clicksPerSession: 'Clicks per session',
        sessionsPerPerson: 'Sessions per person',
        duration: 'Duration',
        depth: 'Pages',
        hours: 'Hours'
    },
    rhythm: {
        peak: 'Peak hour',
        busiest: 'Busiest day',
        night: 'At night, 20–02 h',
        unit: 'sessions'
    },
    interaction: {
        title: 'Interaction',
        customEvents: 'Custom events',
        people: (count: number) => count === 1 ? '1 person' : `${fmt.n(count)} people`,
        frustration: 'Frustration',
        signals: 'Frustration signals'
    },
    performance: {
        title: 'Performance',
        releases: 'Releases',
        appReleases: 'App releases'
    },
    vitals: {
        lcp: 'Largest visible content',
        inp: 'Interaction response',
        cls: 'Visual stability',
        fcp: 'First content',
        ttfb: 'Server response',
        good: 'Good',
        needsImprovement: 'Needs work',
        poor: 'Poor',
        empty: 'No measurements in this period yet.'
    },
    topIssues: {
        label: 'Open errors',
        empty: 'No open errors in this period.',
        sessions: (count: number) => count === 1 ? '1 session' : `${fmt.n(count)} sessions`
    }
};

export default en;
