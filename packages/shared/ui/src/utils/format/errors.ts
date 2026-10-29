import { ApiError } from '../../services/ApiError';

export const toError = (cause: unknown): Error => cause instanceof Error ? cause : new Error(String(cause));

export const isNotFound = (cause: unknown): boolean => cause instanceof ApiError && cause.status === 404;
