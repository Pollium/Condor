import { AuthErrorCode } from '@condor/contracts/auth/errors';
import { baseCodeOf } from '@condor/contracts/shared/errors';
import { useSessionStore } from '../store/session';
import { invalidateCache } from 'alova';

const EXPIRED_CODES: AuthErrorCode[] = ['Auth::Unauthorized', 'Auth::InvalidToken'];

export const isSessionExpired = (status: number, code: string): boolean =>
    status === 401 && EXPIRED_CODES.includes(baseCodeOf(code) as AuthErrorCode);

export const endSession = async () => {
    await invalidateCache();
    useSessionStore.getState().clear();
};
