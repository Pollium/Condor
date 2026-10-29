const memory = new Map<string, string>();

export const readStored = (key: string): string | null => {
    try{
        return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
    }catch{
        return memory.get(key) ?? null;
    }
};

export const writeStored = (key: string, value: string) => {
    memory.set(key, value);
    try{
        window.localStorage.setItem(key, value);
    }catch{
        return;
    }
};

export const removeStored = (key: string) => {
    memory.delete(key);
    try{
        window.localStorage.removeItem(key);
    }catch{
        return;
    }
};

export const readJson = <T>(key: string): T | null => {
    const raw = readStored(key);
    if(raw === null) return null;
    try{
        return JSON.parse(raw) as T;
    }catch{
        return null;
    }
};
