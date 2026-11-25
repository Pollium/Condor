import { AuthUser } from '@condor/contracts/auth/domain';
import { authRoutes } from '@condor/contracts/auth/routes';
import { Query, useQuery } from '@pollium/readable-react/query/useQuery';
import { useSession } from '@pollium/readable-react/session/session';

export const useMe = (): Query<AuthUser> => {
    const token = useSession();
    return useQuery(authRoutes.me, {}, { enabled: token !== null });
};

export const canEdit = (user: AuthUser | null): boolean => user?.role === 'owner' || user?.role === 'admin';
