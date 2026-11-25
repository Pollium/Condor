import { AuthErrors } from '@condor/contracts/auth/errors';
import { AppCopy, CopyOf } from '@pollium/readable-react/errors/copy';
import { copy } from '@/shared/i18n';

export const appCopy: AppCopy = {
    offline: copy.errors.offline,
    unknown: copy.errors.unknown,
    codes: {
        'Auth::Unauthorized': copy.errors.unauthorized,
        'Auth::InvalidToken': copy.errors.unknown,
        'Auth::Forbidden': copy.errors.forbidden,
        'RateLimit::TooManyRequests': copy.errors.tooManyRequests,
        'Request::InvalidId': copy.errors.unknown,
        'Request::InvalidPagination': copy.errors.unknown,
        'Request::FileMissing': copy.errors.unknown,
        'Request::FileTooLarge': copy.errors.unknown,
        'Request::ValidationFailed': copy.errors.validationFailed,
        'Server::Internal': copy.errors.unknown,
        'Project::NotFound': copy.errors.projectNotFound
    }
};

export const authFallback: CopyOf<typeof AuthErrors> = {
    Unauthorized: copy.errors.unauthorized,
    InvalidToken: copy.errors.unknown,
    InvalidCredentials: copy.errors.unknown,
    Forbidden: copy.errors.forbidden,
    SetupClosed: copy.errors.unknown,
    EmailTaken: copy.errors.unknown,
    WrongPassword: copy.errors.unknown
};
