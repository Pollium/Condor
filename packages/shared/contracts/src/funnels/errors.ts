import { ErrorCode, ErrorTable } from '@pollium/readable-contracts/errors';

export const FunnelErrors = {
    domain: 'Funnel',
    causes: {
        NotFound: 404
    }
} as const satisfies ErrorTable;

export type FunnelErrorCode = ErrorCode<typeof FunnelErrors>;
