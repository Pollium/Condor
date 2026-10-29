import { defineErrors } from '@readable/utils/errors/define-errors';
import { SessionErrors } from '@condor/contracts/sessions/errors';

export const SessionError = defineErrors(SessionErrors);
