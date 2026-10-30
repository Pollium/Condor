import { ApiError } from '@condor/ui/services/ApiError';
import { baseCodeOf } from '@condor/contracts/shared/errors';
import { copy } from '@/shared/i18n';

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
