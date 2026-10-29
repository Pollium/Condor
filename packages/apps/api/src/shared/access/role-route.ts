import User from '@/modules/users/models/User';
import { AuthenticatedRoute } from '@readable/auth/AuthenticatedRoute';
import { AuthError } from '@readable/auth/errors';
import { principalId } from '@readable/auth/principalId';
import { MiddlewareFn } from '@readable/decorators/middleware/Middleware';
import { Role } from '@condor/contracts/auth/domain';

export const MEMBER_ROLES: Role[] = ['owner', 'admin', 'viewer'];

export const assertRole = async (userId: string, roles: Role[]) => {
    const user = await User.findOneBy({ id: userId });
    if(user === null) throw AuthError.Unauthorized();
    if(!roles.includes(user.role)) throw AuthError.Forbidden();
};

export const RoleRoute = (...roles: Role[]): MiddlewareFn => async (req, reply) => {
    AuthenticatedRoute(req, reply);
    await assertRole(principalId(req), roles);
};

export const MemberRoute = RoleRoute(...MEMBER_ROLES);

export const EditorRoute = RoleRoute('owner', 'admin');
