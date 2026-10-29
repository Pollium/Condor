import { WireContext } from '@condor/contracts/ingest/wire';

interface NetworkInformation{
    effectiveType?: string;
}

export const browserContext = (release: string | undefined): WireContext => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    return {
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        ...(connection?.effectiveType ? { connection: connection.effectiveType } : {}),
        ...(release ? { release } : {})
    };
};
