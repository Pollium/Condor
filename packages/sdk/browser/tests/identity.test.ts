import Identity from '../src/identity';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.useRealTimers();
});

describe('Identity', () => {
    it('keeps the anonymous id and session across instances', () => {
        const first = new Identity();
        const second = new Identity();
        expect(second.anonymousId).toBe(first.anonymousId);
        expect(second.session.id).toBe(first.session.id);
    });

    it('rotates the session after 30 minutes idle and notifies', () => {
        vi.useFakeTimers({ now: new Date('2026-10-29T12:00:00Z') });
        const identity = new Identity();
        const rotated = vi.fn();
        identity.onRotate(rotated);
        const before = identity.session.id;

        identity.touch(Date.now() + 29 * 60_000);
        expect(identity.session.id).toBe(before);

        identity.touch(Date.now() + 60 * 60_000);
        expect(identity.session.id).not.toBe(before);
        expect(identity.session.seq).toBe(0);
        expect(rotated).toHaveBeenCalledOnce();
    });

    it('numbers replay chunks per session and decides sampling once', () => {
        const identity = new Identity();
        expect(identity.nextSeq()).toBe(0);
        expect(identity.nextSeq()).toBe(1);
        expect(new Identity().nextSeq()).toBe(2);

        const sampled = identity.sample(50);
        expect(identity.sample(0)).toBe(sampled);
        expect(identity.sample(100)).toBe(sampled);
    });

    it('forgets the user and starts over on reset', () => {
        const identity = new Identity();
        identity.identify('cus_1');
        const anonymousId = identity.anonymousId;
        identity.reset();
        expect(identity.userId).toBeNull();
        expect(identity.anonymousId).not.toBe(anonymousId);
    });
});
