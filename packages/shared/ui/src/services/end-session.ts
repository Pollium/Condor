import { AuthErrorCode } from '@condor/contracts/auth/errors';
import { baseCodeOf } from '@pollium/readable-contracts/errors';

const EXPIRED_CODES: AuthErrorCode[] = ['Auth::Unauthorized', 'Auth::InvalidToken'];

export const isSessionExpired = (status: number, code: string): boolean =>
    status === 401 && EXPIRED_CODES.includes(baseCodeOf(code) as AuthErrorCode);
