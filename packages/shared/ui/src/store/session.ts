import { SessionState } from '../contracts/session';
import { readToken, writeToken } from '../utils/session/session';
import { create } from 'zustand';

export const useSessionStore = create<SessionState>((set) => ({
    token: readToken(),
    setToken: (token) => {
        writeToken(token);
        set({ token });
    },
    clear: () => {
        writeToken(null);
        set({ token: null });
    }
}));
