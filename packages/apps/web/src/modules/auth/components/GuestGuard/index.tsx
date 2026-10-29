import { useSessionStore } from '@condor/ui/store/session';
import { Navigate, Outlet } from 'react-router-dom';

const GuestGuard = () => {
    const token = useSessionStore((state) => state.token);
    return token === null ? <Outlet /> : <Navigate to='/' replace />;
};

export default GuestGuard;
