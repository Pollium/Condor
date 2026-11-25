import { AuthErrors } from '@condor/contracts/auth/errors';
import { copyFor } from '@pollium/readable-react/errors/copy';
import { copy } from '@/modules/account/i18n';
import { authFallback } from '@/shared/utils/error-copy';

export const accountError = copyFor(AuthErrors, {
    ...authFallback,
    EmailTaken: copy.errors.emailTaken,
    WrongPassword: copy.errors.wrongPassword,
    InvalidCredentials: copy.errors.wrongPassword
});
