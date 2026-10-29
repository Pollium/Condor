import { normalizePath } from '../services/PathNormalizer';
import { describe, expect, it } from 'vitest';

describe('normalizePath', () => {
    it('strips the query and the hash from both paths', () => {
        expect(normalizePath('/pricing?plan=pro#faq', [])).toEqual({ path: '/pricing', rawPath: '/pricing' });
        expect(normalizePath('?ref=ad', [])).toEqual({ path: '/', rawPath: '/' });
    });

    it('applies a route group with a named segment', () => {
        expect(normalizePath('/products/blue-shoes', ['/products/:slug']))
            .toEqual({ path: '/products/:slug', rawPath: '/products/blue-shoes' });
        expect(normalizePath('/products/blue-shoes/reviews', ['/products/:slug']).path).toBe('/products/blue-shoes/reviews');
    });

    it('applies a trailing wildcard to the rest of the path', () => {
        expect(normalizePath('/docs/guides/install/linux', ['/docs/*'])).toEqual({
            path: '/docs/*',
            rawPath: '/docs/guides/install/linux'
        });
        expect(normalizePath('/blog/2026/hello', ['/products/:slug', '/blog/*']).path).toBe('/blog/*');
    });

    it('collapses id-like segments when no group matches', () => {
        expect(normalizePath('/orders/0196f1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/items/42', []).path).toBe('/orders/:id/items/:id');
        expect(normalizePath('/invoices/a1b2c3d4e5/', []).path).toBe('/invoices/:id');
        expect(normalizePath('/share/Xk9mP2qRt7', []).path).toBe('/share/:id');
    });

    it('keeps words and short tokens', () => {
        expect(normalizePath('/settings/billing', []).path).toBe('/settings/billing');
        expect(normalizePath('/v2/deadbeef', []).path).toBe('/v2/deadbeef');
        expect(normalizePath('/size/xl2', []).path).toBe('/size/xl2');
    });
});
