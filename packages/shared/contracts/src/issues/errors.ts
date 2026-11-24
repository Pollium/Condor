import { ErrorCode, ErrorTable } from '@pollium/readable-contracts/errors';

export const IssueErrors = {
    domain: 'Issue',
    causes: {
        NotFound: 404
    }
} as const satisfies ErrorTable;

export type IssueErrorCode = ErrorCode<typeof IssueErrors>;
