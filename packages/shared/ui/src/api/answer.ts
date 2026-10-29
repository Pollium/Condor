import { ApiError as ApiErrorPayload } from '@condor/contracts/shared/http';
import { ApiError } from '../services/ApiError';
import { endSession, isSessionExpired } from '../services/end-session';
import { unwrap } from './unwrap';

export const NETWORK_FAILED = 'Network request failed';

const SUCCESS_FLOOR = 200;
const SUCCESS_CEILING = 300;

export const answerOf = async (status: number, statusText: string, payload: unknown): Promise<unknown> => {
    if(status >= SUCCESS_FLOOR && status < SUCCESS_CEILING) return unwrap(payload);

    const message = (payload as ApiErrorPayload | undefined)?.error ?? statusText;
    if(isSessionExpired(status, message)) await endSession();

    throw new ApiError(status, message, payload);
};
