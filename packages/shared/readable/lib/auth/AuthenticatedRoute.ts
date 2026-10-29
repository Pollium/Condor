import { MiddlewareFn } from '../decorators/middleware/Middleware';
import { bearerPrincipal } from './bearerPrincipal';
import { AuthError } from './errors';

export const AuthenticatedRoute: MiddlewareFn = (req) => {
    const principal = bearerPrincipal(req);
    if(principal === null) throw AuthError.Unauthorized();

    req.principal = principal;
};
