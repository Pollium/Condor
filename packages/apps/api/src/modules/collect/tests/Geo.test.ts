import GeoService from '../services/Geo';
import { describe, expect, it } from 'vitest';

const IP = '203.0.113.7';

describe('GeoService', () => {
    it('reads trusted proxy headers', async () => {
        const geo = new GeoService(null, true);

        expect(await geo.locate(IP, {
            'x-vercel-ip-country': 'cl',
            'x-geo-region': 'Región Metropolitana',
            'x-vercel-ip-city': 'Vi%C3%B1a%20del%20Mar'
        })).toEqual({ country: 'CL', region: 'Región Metropolitana', city: 'Viña del Mar' });
    });

    it('prefers the Cloudflare country and skips unknown codes', async () => {
        const geo = new GeoService(null, true);

        expect((await geo.locate(IP, { 'cf-ipcountry': 'AR', 'x-geo-country': 'PE' })).country).toBe('AR');
        expect(await geo.locate(IP, { 'cf-ipcountry': 'XX', 'x-geo-country': 'PE', 'x-geo-city': 'Lima' }))
            .toEqual({ country: 'PE', region: null, city: 'Lima' });
        expect(await geo.locate(IP, { 'x-geo-country': 'CO', 'x-geo-city': 'Medell%C3%ADn' }))
            .toEqual({ country: 'CO', region: null, city: 'Medellín' });
    });

    it('ignores the headers unless they are trusted', async () => {
        const geo = new GeoService(null, false);

        expect(await geo.locate(IP, { 'cf-ipcountry': 'CL', 'x-geo-city': 'Santiago' }))
            .toEqual({ country: null, region: null, city: null });
    });
});
