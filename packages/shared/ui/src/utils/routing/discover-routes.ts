import { DiscoveredRoute, PageLoader } from '../../contracts/route';
import { defineErrors } from '../../errors/define-errors';
import { parseRouteFile } from './parse-route-file';
import { registerRouteLoader } from './route-prefetch';

const DiscoveryError = defineErrors({
    domain: 'Discovery',
    causes: {
        DuplicateRoutePath: 500
    }
} as const);

export const discoverRoutes = (modules: Record<string, () => Promise<unknown>>): DiscoveredRoute[] => {
    const routes = Object.entries(modules).map(([file, load]) => {
        const { tier, kind, path } = parseRouteFile(file);
        return {
            tier,
            kind,
            path,
            load: load as PageLoader
        };
    });

    const seen = new Set<string>();
    for(const route of routes){
        const key = `${route.kind} ${route.path}`;
        if(seen.has(key)) throw DiscoveryError.DuplicateRoutePath(key);
        seen.add(key);
    }

    for(const route of routes) registerRouteLoader(route.path, route.load);

    return routes;
};
