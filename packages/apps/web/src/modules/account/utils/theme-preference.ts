import { Theme } from '@condor/ui/contracts/theme';

export type ThemePreference = Theme | 'system';

const STORAGE_KEY = 'condor.theme';

export const readPreference = (): ThemePreference => {
    try{
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === 'light' || saved === 'dark' ? saved : 'system';
    }catch{
        return 'system';
    }
};

export const systemTheme = (): Theme => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const rememberSystem = () => {
    try{
        localStorage.setItem(STORAGE_KEY, 'system');
    }catch{
        return;
    }
};
