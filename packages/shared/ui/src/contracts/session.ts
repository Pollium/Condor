export interface SessionState{
    token: string | null;
    setToken: (token: string | null) => void;
    clear: () => void;
}
