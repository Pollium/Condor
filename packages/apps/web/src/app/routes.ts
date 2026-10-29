import { DiscoveredRoute } from '@condor/ui/contracts/route';
import { discoverRoutes as fromModules } from '@condor/ui/utils/routing/discover-routes';

const modules = import.meta.glob([
    '/src/modules/*/pages/{guest,protected}/index.tsx',
    '/src/modules/*/pages/{guest,protected}/**/index.tsx'
]);

export const discoverRoutes = (): DiscoveredRoute[] => fromModules(modules);
