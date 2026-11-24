import User from '@/modules/users/models/User';
import { AuthenticatedRoute } from '@pollium/readable/auth/guards';
import { AuthError } from '@/modules/auth/contracts/domain/errors';
import { principalId } from '@pollium/readable/auth/params';
import { MiddlewareFn } from '@pollium/readable/http/middleware';
import { Role } from '@condor/contracts/auth/domain';

export const MEMBER_ROLES: Role[] = ['owner', 'admin', 'viewer'];

export const assertRole = async (userId: string, roles: Role[]) => {
    const user = await User.findOneBy({ id: userId });
    if(user === null) throw AuthError.Unauthorized();
    if(!roles.includes(user.role)) throw AuthError.Forbidden();
};

export const RoleRoute = (...roles: Role[]): MiddlewareFn => async (req, reply) => {
    await AuthenticatedRoute(req, reply);
    await assertRole(principalId(req), roles);
};

export const MemberRoute = RoleRoute(...MEMBER_ROLES);

export const EditorRoute = RoleRoute('owner', 'admin');
