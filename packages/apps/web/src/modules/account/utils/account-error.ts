import { copy } from '@/modules/account/i18n';
import { errorCopy } from '@/shared/utils/error-copy';

export const accountError = errorCopy({
    'Auth::EmailTaken': copy.errors.emailTaken,
    'Auth::WrongPassword': copy.errors.wrongPassword,
    'Auth::InvalidCredentials': copy.errors.wrongPassword
});
