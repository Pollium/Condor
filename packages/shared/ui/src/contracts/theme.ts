export type Theme = 'light' | 'dark';

export interface ThemeState{
    theme: Theme;
    set: (theme: Theme) => void;
    toggle: () => void;
}
