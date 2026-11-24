import { ErrorCode, ErrorTable } from '@pollium/readable-contracts/errors';

export const ProjectErrors = {
    domain: 'Project',
    causes: {
        NotFound: 404,
        Forbidden: 403
    }
} as const satisfies ErrorTable;

export type ProjectErrorCode = ErrorCode<typeof ProjectErrors>;
