import { ErrorCode, ErrorTable } from '../shared/errors';

export const SessionErrors = {
    domain: 'Session',
    causes: {
        NotFound: 404,
        NoReplay: 404,
        PersonNotFound: 404
    }
} as const satisfies ErrorTable;

export type SessionErrorCode = ErrorCode<typeof SessionErrors>;
