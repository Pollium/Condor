import { NIL_UUID, uuidv7 } from '../lib/utils/uuidv7';
import { describe, expect, it } from 'vitest';

describe('uuidv7', () => {
    it('mints a version-7 uuid', () => {
        const id = uuidv7();

        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('exports the nil uuid the digest cursors start from', () => {
        expect(NIL_UUID).toBe('00000000-0000-0000-0000-000000000000');
    });
});
