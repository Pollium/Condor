import { parseUserAgent } from '../services/UserAgent';
import { describe, expect, it } from 'vitest';

const DESKTOP_CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const IPAD_SAFARI = 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const HEADLESS_CHROME = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0 Safari/537.36';

describe('parseUserAgent', () => {
    it('reads a desktop Chrome', () => {
        expect(parseUserAgent(DESKTOP_CHROME, false)).toEqual({
            os: 'Windows',
            osVersion: 'NT 10.0',
            browser: 'Chrome',
            browserVersion: '130.0.0.0',
            device: 'desktop',
            isBot: false
        });
    });

    it('reads an iPhone Safari as mobile', () => {
        expect(parseUserAgent(IPHONE_SAFARI, false)).toEqual({
            os: 'iOS',
            osVersion: '17.5',
            browser: 'Safari',
            browserVersion: '17.5',
            device: 'mobile',
            isBot: false
        });
    });

    it('reads an iPad as a tablet', () => {
        expect(parseUserAgent(IPAD_SAFARI, false)).toMatchObject({ os: 'iOS', device: 'tablet', isBot: false });
    });

    it('flags Googlebot', () => {
        expect(parseUserAgent(GOOGLEBOT, false).isBot).toBe(true);
    });

    it('flags HeadlessChrome unless headless browsers are allowed', () => {
        expect(parseUserAgent(HEADLESS_CHROME, false).isBot).toBe(true);
        expect(parseUserAgent(HEADLESS_CHROME, true)).toMatchObject({ browser: 'Chrome', os: 'Linux', isBot: false });
    });

    it('flags a missing user agent', () => {
        expect(parseUserAgent(undefined, true).isBot).toBe(true);
    });
});
