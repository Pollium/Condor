import { ApiError } from '@condor/ui/services/ApiError';
import { baseCodeOf } from '@condor/contracts/shared/errors';

const SHARED: Record<string, string> = {
    'Auth::Forbidden': 'Tu rol no permite hacer esto.',
    'Auth::Unauthorized': 'Tu sesión terminó. Vuelve a entrar.',
    'RateLimit::TooManyRequests': 'Demasiados intentos. Espera un momento y vuelve a probar.',
    'Request::ValidationFailed': 'Revisa los campos marcados.',
    'Project::NotFound': 'Esta app ya no existe.'
};

export const errorCopy = (messages: Partial<Record<string, string>> = {}) => (error: Error | undefined): string | null => {
    if(error === undefined) return null;
    if(error instanceof ApiError && error.isNetworkError) return 'No hay conexión con Condor. Revisa que los servicios estén en marcha.';

    const code = baseCodeOf(error.message);
    return messages[code] ?? SHARED[code] ?? 'Algo salió mal. Vuelve a intentarlo.';
};

export const fieldErrors = (error: Error | undefined): Record<string, string> => {
    if(!(error instanceof ApiError)) return {};
    const body = error.body as { errors?: Record<string, string> } | undefined;
    return body?.errors ?? {};
};
