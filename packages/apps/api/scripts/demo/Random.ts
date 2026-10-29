import { Weighted } from './types';

const UINT32 = 4_294_967_296;
const UUID_BYTES = 16;

export default class Random{
    #state: number;

    constructor(seed: number){
        this.#state = seed >>> 0;
    }

    next(): number{
        this.#state = (this.#state + 0x6d2b79f5) >>> 0;
        let mixed = this.#state;
        mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

        return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32;
    }

    between(min: number, max: number): number{
        return min + this.next() * (max - min);
    }

    int(min: number, max: number): number{
        return Math.floor(this.between(min, max + 1));
    }

    chance(probability: number): boolean{
        return this.next() < probability;
    }

    pick<T>(items: readonly T[]): T{
        return items[Math.floor(this.next() * items.length)];
    }

    weighted<T>(entries: readonly Weighted<T>[]): T{
        const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
        let remaining = this.next() * total;
        for(const entry of entries){
            remaining -= entry.weight;
            if(remaining < 0) return entry.value;
        }

        return entries[entries.length - 1].value;
    }

    hex(length: number): string{
        return Array.from({ length }, () => Math.floor(this.next() * 16).toString(16)).join('');
    }

    uuid(): string{
        const bytes = Array.from({ length: UUID_BYTES }, () => Math.floor(this.next() * 256));
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');

        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
}
