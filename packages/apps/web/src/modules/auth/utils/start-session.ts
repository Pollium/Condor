import { AuthSession } from '@condor/contracts/auth/domain';
import { useSessionStore } from '@condor/ui/store/session';
import { invalidateCache } from 'alova';

export const startSession = async (session: AuthSession) => {
    await invalidateCache();
    useSessionStore.getState().setToken(session.token);
};
