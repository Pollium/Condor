import { useSessionStore } from '@condor/ui/store/session';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedGuard = () => {
    const token = useSessionStore((state) => state.token);
    const location = useLocation();

    if(token === null){
        const next = `${location.pathname}${location.search}`;
        return <Navigate to={next === '/' ? '/entrar' : `/entrar?next=${encodeURIComponent(next)}`} replace />;
    }
    return <Outlet />;
};

export default ProtectedGuard;
