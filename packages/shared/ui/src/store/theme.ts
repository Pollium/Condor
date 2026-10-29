import { Theme, ThemeState } from '../contracts/theme';
import { applyTheme, resolveTheme, saveTheme } from '../utils/session/theme';
import { create } from 'zustand';

export const useThemeStore = create<ThemeState>((set) => ({
    theme: resolveTheme(),
    set: (theme: Theme) => {
        applyTheme(theme);
        saveTheme(theme);
        set({ theme });
    },
    toggle: () => set((state) => {
        const theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(theme);
        saveTheme(theme);

        return { theme };
    })
}));
