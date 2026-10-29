import { useSessionStore } from '../store/session';

export const requestAuth = (): Record<string, string> => {
    const token = useSessionStore.getState().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
};
