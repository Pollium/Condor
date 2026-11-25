import { IssueErrors } from '@condor/contracts/issues/errors';
import { copyFor } from '@pollium/readable-react/errors/copy';
import { copy } from '@/modules/issues/i18n';

export const issueError = copyFor(IssueErrors, {
    NotFound: copy.errors.notFound
});
