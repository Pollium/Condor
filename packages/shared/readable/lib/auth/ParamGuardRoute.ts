import { AuthenticatedRoute } from '../auth/AuthenticatedRoute';
import { principalId } from '../auth/principalId';
import { MiddlewareFn } from '../decorators/middleware/Middleware';
import { parseId } from '../utils/controllers/parse-id';

export type MembershipAssertion = (scopeId: string, userId: string) => Promise<unknown>;

export const ParamGuardRoute = (param: string, assert: MembershipAssertion): MiddlewareFn => async (req, reply) => {
    AuthenticatedRoute(req, reply);
    const scopeId = parseId((req.params as Record<string, string | undefined>)[param]);
    await assert(scopeId, principalId(req));
};
