import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const KEY = 'condor.theme';

const stored = (): string | null => {
    try{
        return localStorage.getItem(KEY);
    }catch{
        return null;
    }
};

const resolveTheme = (): Theme => {
    const fromQuery = new URLSearchParams(window.location.search).get('theme');
    if(fromQuery === 'light' || fromQuery === 'dark') return fromQuery;

    const saved = stored();
    if(saved === 'light' || saved === 'dark') return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('cds--g100', theme === 'dark');
    root.classList.toggle('cds--white', theme === 'light');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
};

const saveTheme = (theme: Theme) => {
    try{
        localStorage.setItem(KEY, theme);
    }catch{
        return;
    }
};

export const initTheme = () => applyTheme(resolveTheme());

interface ThemeState{
    theme: Theme;
    set: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: resolveTheme(),
    set: (theme) => {
        applyTheme(theme);
        saveTheme(theme);
        set({ theme });
    }
}));
