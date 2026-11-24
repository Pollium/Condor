import { ErrorCode, ErrorTable } from '@pollium/readable-contracts/errors';

export const IngestErrors = {
    domain: 'Ingest',
    causes: {
        UnknownKey: 401,
        MalformedPayload: 400,
        PayloadTooLarge: 413,
        Disabled: 403
    }
} as const satisfies ErrorTable;

export type IngestErrorCode = ErrorCode<typeof IngestErrors>;
