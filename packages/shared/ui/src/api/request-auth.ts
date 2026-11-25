import { session } from '@pollium/readable-react/session/session';

export const requestAuth = (): Record<string, string> => {
    const token = session.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
};
