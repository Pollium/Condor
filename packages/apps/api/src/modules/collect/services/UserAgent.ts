import { Device } from '@condor/contracts/shared/analytics';
import Bowser from 'bowser';

export interface ParsedUserAgent{
    os: string | null;
    osVersion: string | null;
    browser: string | null;
    browserVersion: string | null;
    device: Device;
    isBot: boolean;
}

const BOT_PATTERN = /bot\b|crawl|spider|slurp|scrap|facebookexternalhit|embedly|lighthouse|pagespeed|phantomjs|selenium|puppeteer|playwright|curl\/|wget\/|python|go-http-client|java\/|okhttp|axios\/|node-fetch|undici/i;
const HEADLESS_PATTERN = /headlesschrome/i;

const EMPTY_AGENT: ParsedUserAgent = {
    os: null,
    osVersion: null,
    browser: null,
    browserVersion: null,
    device: 'desktop',
    isBot: true
};

const deviceOf = (platformType: string | undefined): Device => {
    if(platformType === 'mobile' || platformType === 'tablet') return platformType;
    return 'desktop';
};

const isBotAgent = (header: string, platformType: string | undefined, allowHeadless: boolean): boolean => {
    if(platformType === 'bot' || BOT_PATTERN.test(header)) return true;
    return !allowHeadless && HEADLESS_PATTERN.test(header);
};

export const parseUserAgent = (header: string | undefined, allowHeadless: boolean): ParsedUserAgent => {
    const agent = header?.trim() ?? '';
    if(agent === '') return EMPTY_AGENT;

    const { browser, os, platform } = Bowser.parse(agent);

    return {
        os: os.name ?? null,
        osVersion: os.version ?? null,
        browser: browser.name ?? null,
        browserVersion: browser.version ?? null,
        device: deviceOf(platform.type),
        isBot: isBotAgent(agent, platform.type, allowHeadless)
    };
};
