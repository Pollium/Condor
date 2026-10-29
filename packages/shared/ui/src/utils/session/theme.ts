import { Theme } from '../../contracts/theme';

const STORAGE_KEY = 'condor.theme';

const stored = (): string | null => {
    try{
        return localStorage.getItem(STORAGE_KEY);
    }catch{
        return null;
    }
};

export const resolveTheme = (): Theme => {
    const fromQuery = new URLSearchParams(window.location.search).get('theme');
    if(fromQuery === 'light' || fromQuery === 'dark') return fromQuery;

    const saved = stored();
    if(saved === 'light' || saved === 'dark') return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('cds--g100', theme === 'dark');
    root.classList.toggle('cds--white', theme === 'light');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
};

export const saveTheme = (theme: Theme | 'system') => {
    try{
        localStorage.setItem(STORAGE_KEY, theme);
    }catch{
        return;
    }
};

export const initTheme = () => applyTheme(resolveTheme());
