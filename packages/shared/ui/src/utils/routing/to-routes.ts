import { DiscoveredRoute } from '../../contracts/route';
import { lazyElement } from './lazy-element';
import { RouteObject } from 'react-router-dom';

const depthOf = (path: string): number => path.split('/').filter(Boolean).length;

const isIndexOf = (page: DiscoveredRoute, layout: DiscoveredRoute): boolean => page.path === layout.path;

const isDirectChildOf = (page: DiscoveredRoute, layout: DiscoveredRoute): boolean =>
    page.path.startsWith(`${layout.path}/`) && depthOf(page.path) === depthOf(layout.path) + 1;

const ownerOf = (page: DiscoveredRoute, layouts: DiscoveredRoute[]): DiscoveredRoute | undefined =>
    layouts.find((layout) => isIndexOf(page, layout) || isDirectChildOf(page, layout));

const relative = (path: string, parent: string): string => path.slice(parent.length + 1);

const toRoute = (page: DiscoveredRoute, parent: string | null): RouteObject => {
    const path = parent === null ? page.path.replace(/^\//, '') : relative(page.path, parent);

    return path === ''
        ? { index: true, element: lazyElement(page.load) }
        : { path, element: lazyElement(page.load) };
};

export const toRoutes = (list: DiscoveredRoute[]): RouteObject[] => {
    const layouts = list.filter((route) => route.kind === 'layout');
    const pages = list.filter((route) => route.kind === 'page');
    const loose = pages.filter((page) => ownerOf(page, layouts) === undefined);
    const nested = layouts.map((layout) => ({
        path: layout.path.replace(/^\//, ''),
        element: lazyElement(layout.load),
        children: pages
            .filter((page) => ownerOf(page, layouts) === layout)
            .map((page) => toRoute(page, layout.path))
    }));

    return [...loose.map((page) => toRoute(page, null)), ...nested];
};
