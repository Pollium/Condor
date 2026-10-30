import type es from '@/app/i18n/es';

const en: typeof es = {
    periods: {
        '24h': 'Last 24 hours',
        '7d': 'Last 7 days',
        '30d': 'Last 30 days',
        '90d': 'Last 90 days'
    },
    period: 'Period',
    skipToContent: 'Skip to content',
    openMenu: 'Open the menu',
    closeMenu: 'Close the menu',
    switchApp: 'Switch app',
    chooseApp: 'Choose an app',
    addApp: 'Add an app',
    addAppEllipsis: 'Add an app…',
    liveNow: (count: number, app: string) => `${count} ${count === 1 ? 'person' : 'people'} on ${app} now`,
    live: (count: number) => `${count} live`,
    search: 'Search',
    lightTheme: 'Use the light theme',
    darkTheme: 'Use the dark theme',
    account: 'Account',
    yourAccount: 'Your account',
    team: 'Team',
    signOut: 'Sign out',
    navigation: 'Navigation',
    settings: 'Settings'
};

export default en;
