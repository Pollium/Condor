import { RouteTier } from '@condor/ui/contracts/route';
import { toRoutes } from '@condor/ui/utils/routing/to-routes';
import ConsoleLayout from '@/app/layouts/ConsoleLayout';
import { discoverRoutes } from '@/app/routes';
import GuestGuard from '@/modules/auth/components/GuestGuard';
import ProtectedGuard from '@/modules/auth/components/ProtectedGuard';
import { createBrowserRouter, Navigate } from 'react-router-dom';

const routes = discoverRoutes();

const tier = (name: RouteTier) => toRoutes(routes.filter((route) => route.tier === name));

export const router = createBrowserRouter([
    {
        element: <GuestGuard />,
        children: tier('guest')
    },
    {
        element: <ProtectedGuard />,
        children: [{ element: <ConsoleLayout />, children: tier('protected') }]
    },
    {
        path: '*',
        element: <Navigate to='/' replace />
    }
]);
