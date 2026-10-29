import { create } from 'zustand';

interface ToolbarState{
    toolbar: HTMLElement | null;
    setToolbar: (toolbar: HTMLElement | null) => void;
}

export const useToolbarStore = create<ToolbarState>((set) => ({
    toolbar: null,
    setToolbar: (toolbar) => set({ toolbar })
}));
