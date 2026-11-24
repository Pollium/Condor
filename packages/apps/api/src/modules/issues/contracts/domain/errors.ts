import { defineErrors } from '@pollium/readable/app/errors';
import { IssueErrors } from '@condor/contracts/issues/errors';

export const IssueError = defineErrors(IssueErrors);
