import { defineErrors } from '@pollium/readable/app/errors';
import { SessionErrors } from '@condor/contracts/sessions/errors';

export const SessionError = defineErrors(SessionErrors);
