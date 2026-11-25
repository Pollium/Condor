import { AuthUser } from '@condor/contracts/auth/domain';
import { Query } from '@condor/ui/contracts/api';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { useSession } from '@pollium/readable-react/session/session';
import { authApi } from '@/modules/auth/api/api';

export const useMe = (): Query<AuthUser> => {
    const token = useSession();
    return useQuery(authApi.me, [], { enabled: token !== null });
};

export const canEdit = (user: AuthUser | null): boolean => user?.role === 'owner' || user?.role === 'admin';
