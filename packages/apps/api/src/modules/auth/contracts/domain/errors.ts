import { defineErrors } from '@readable/utils/errors/define-errors';
import { AuthErrors } from '@condor/contracts/auth/errors';

export const AuthError = defineErrors(AuthErrors);
