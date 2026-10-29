import JWTService from './JWTService';
import { AuthError } from './errors';
import { Principal } from './types';
import { FastifyRequest } from 'fastify';

const SCHEME = 'Bearer ';

export const bearerPrincipal = (req: FastifyRequest): Principal | null => {
    const header = req.headers.authorization;
    if(!header?.startsWith(SCHEME)) return null;

    try{
        const { sub } = new JWTService().verify(header.slice(SCHEME.length).trim());
        return { userId: sub };
    }catch{
        throw AuthError.InvalidToken();
    }
};
