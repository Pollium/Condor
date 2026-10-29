import { beforeEach } from 'vitest';

class MemoryStorage implements Storage{
    #items = new Map<string, string>();

    get length(): number{
        return this.#items.size;
    }

    clear(){
        this.#items.clear();
    }

    getItem(key: string): string | null{
        return this.#items.get(key) ?? null;
    }

    key(index: number): string | null{
        return Array.from(this.#items.keys())[index] ?? null;
    }

    removeItem(key: string){
        this.#items.delete(key);
    }

    setItem(key: string, value: string){
        this.#items.set(key, value);
    }
}

Object.defineProperty(window, 'localStorage', { value: new MemoryStorage(), configurable: true });

beforeEach(() => {
    window.localStorage.clear();
    document.body.innerHTML = '';
});
