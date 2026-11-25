import { ApiError } from '@condor/ui/services/ApiError';
import { baseCodeOf } from '@pollium/readable-contracts/errors';
import { AppCopy } from '@pollium/readable-react/errors/copy';
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

const SHARED: Record<string, string> = {
    'Auth::Forbidden': copy.errors.forbidden,
    'Auth::Unauthorized': copy.errors.unauthorized,
    'RateLimit::TooManyRequests': copy.errors.tooManyRequests,
    'Request::ValidationFailed': copy.errors.validationFailed,
    'Project::NotFound': copy.errors.projectNotFound
};

export const errorCopy = (messages: Partial<Record<string, string>> = {}) => (error: Error | undefined): string | null => {
    if(error === undefined) return null;
    if(error instanceof ApiError && error.isNetworkError) return copy.errors.offline;

    const code = baseCodeOf(error.message);
    return messages[code] ?? SHARED[code] ?? copy.errors.unknown;
};

export const fieldErrors = (error: Error | undefined): Record<string, string> => {
    if(!(error instanceof ApiError)) return {};
    const body = error.body as { errors?: Record<string, string> } | undefined;
    return body?.errors ?? {};
};
