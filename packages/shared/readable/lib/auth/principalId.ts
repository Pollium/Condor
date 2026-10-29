import { AuthError } from './errors';
import { FastifyRequest } from 'fastify';

export const principalId = (req: FastifyRequest): string => {
    if(!req.principal) throw AuthError.Unauthorized();
    return req.principal.userId;
};
