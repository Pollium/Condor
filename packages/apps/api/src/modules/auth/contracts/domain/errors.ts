import { defineErrors } from '@pollium/readable/app/errors';
import { AuthErrors } from '@condor/contracts/auth/errors';

export const AuthError = defineErrors(AuthErrors);
