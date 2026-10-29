import { attribute } from '../services/Attribution';
import { describe, expect, it } from 'vitest';

const SITE = { projectHost: 'shop.example.com', pageHost: 'shop.example.com' };

const channelFor = (referrer: string): unknown => attribute({ ...SITE, referrer })?.channel;

describe('attribute', () => {
    it('leaves a visit with no referrer and no utm unattributed', () => {
        expect(attribute(SITE)).toBeUndefined();
        expect(attribute({ ...SITE, referrer: '', utm: { source: ' ' } })).toBeUndefined();
    });

    it('leaves an internal referrer unattributed', () => {
        expect(attribute({ ...SITE, referrer: 'https://www.shop.example.com/cart' })).toBeUndefined();
        expect(attribute({ projectHost: 'https://example.com', pageHost: 'preview.example.dev', referrer: 'https://preview.example.dev/' }))
            .toBeUndefined();
    });

    it('classifies search, social, messaging and ai referrers', () => {
        expect(channelFor('https://www.google.cl/')).toBe('organic');
        expect(channelFor('https://search.brave.com/search?q=shoes')).toBe('organic');
        expect(channelFor('https://l.instagram.com/?u=x')).toBe('social');
        expect(channelFor('https://t.co/abc')).toBe('social');
        expect(channelFor('https://web.whatsapp.com/')).toBe('messaging');
        expect(channelFor('https://chatgpt.com/')).toBe('ai');
        expect(channelFor('https://gemini.google.com/app')).toBe('ai');
        expect(channelFor('https://blog.someone.dev/post')).toBe('referral');
    });

    it('describes an external referrer with its canonical source', () => {
        expect(attribute({ ...SITE, referrer: 'https://www.google.com/search?q=condor' })).toEqual({
            channel: 'organic',
            source: 'Google',
            referrer: 'https://www.google.com/search?q=condor',
            referrerHost: 'google.com',
            utmSource: null,
            utmMedium: null,
            utmCampaign: null,
            utmContent: null,
            utmTerm: null
        });
        expect(attribute({ ...SITE, referrer: 'https://blog.someone.dev/post' })).toMatchObject({
            channel: 'referral',
            source: 'blog.someone.dev'
        });
    });

    it('reads paid and email campaigns from the utm medium', () => {
        expect(attribute({ ...SITE, utm: { source: 'google', medium: 'cpc', campaign: 'spring' } })).toMatchObject({
            channel: 'paid',
            source: 'Google',
            referrer: null,
            utmCampaign: 'spring'
        });
        expect(attribute({ ...SITE, utm: { source: 'october-digest', medium: 'Newsletter' } })).toMatchObject({
            channel: 'email',
            source: 'october-digest'
        });
    });

    it('lets the utm win over the referrer', () => {
        expect(attribute({ ...SITE, referrer: 'https://www.google.com/', utm: { source: 'mailchimp', medium: 'email' } }))
            .toMatchObject({ channel: 'email', source: 'mailchimp', referrerHost: 'google.com' });
        expect(attribute({ ...SITE, referrer: 'https://m.facebook.com/', utm: { source: 'whatsapp' } }))
            .toMatchObject({ channel: 'messaging', source: 'WhatsApp' });
    });

    it('attributes a tagged link even from an internal referrer', () => {
        expect(attribute({ ...SITE, referrer: 'https://shop.example.com/', utm: { source: 'instagram', medium: 'bio' } }))
            .toMatchObject({ channel: 'social', source: 'Instagram', referrer: null, referrerHost: null });
    });
});
