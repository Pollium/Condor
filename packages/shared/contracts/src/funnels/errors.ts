import { ErrorCode, ErrorTable } from '../shared/errors';

export const FunnelErrors = {
    domain: 'Funnel',
    causes: {
        NotFound: 404
    }
} as const satisfies ErrorTable;

export type FunnelErrorCode = ErrorCode<typeof FunnelErrors>;
