import JWTService from './JWTService';
import { MiddlewareFn } from '../decorators/middleware/Middleware';
import { AuthError } from './errors';

export const SocketAuthenticatedRoute: MiddlewareFn = (req) => {
    const token = tokenFromSubprotocol(req.headers['sec-websocket-protocol']) ?? tokenFromQuery(req.query);
    if(!token) throw AuthError.Unauthorized();

    try{
        const { sub } = new JWTService().verify(token);
        req.principal = { userId: sub };
    }catch{
        throw AuthError.InvalidToken();
    }
};

const tokenFromSubprotocol = (header: string | undefined): string | undefined => {
    const token = header?.split(',')[0]?.trim();
    return token || undefined;
};

const tokenFromQuery = (query: unknown): string | undefined => {
    const token = (query as { token?: string }).token?.trim();
    return token || undefined;
};
