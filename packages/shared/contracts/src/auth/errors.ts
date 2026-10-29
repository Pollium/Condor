import { ErrorCode, ErrorTable } from '../shared/errors';

export const AuthErrors = {
    domain: 'Auth',
    causes: {
        Unauthorized: 401,
        InvalidToken: 401,
        InvalidCredentials: 401,
        Forbidden: 403,
        SetupClosed: 409,
        EmailTaken: 409,
        WrongPassword: 400
    }
} as const satisfies ErrorTable;

export type AuthErrorCode = ErrorCode<typeof AuthErrors>;
