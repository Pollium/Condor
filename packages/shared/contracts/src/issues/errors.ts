import { ErrorCode, ErrorTable } from '../shared/errors';

export const IssueErrors = {
    domain: 'Issue',
    causes: {
        NotFound: 404
    }
} as const satisfies ErrorTable;

export type IssueErrorCode = ErrorCode<typeof IssueErrors>;
