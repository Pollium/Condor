import { QueryFailedError } from 'typeorm';

export const isUniqueViolation = (error: unknown): error is QueryFailedError => {
    return (error instanceof QueryFailedError && error.driverError.code === '23505');
};