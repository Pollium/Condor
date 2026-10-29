import { PageLoader } from '../../contracts/route';
import { matchPath } from 'react-router-dom';

const loaders = new Map<string, PageLoader[]>();
const requested = new Map<string, Promise<void>>();

export const registerRouteLoader = (path: string, load: PageLoader) => {
    const registered = loaders.get(path);

    if(registered) registered.push(load);
    else loaders.set(path, [load]);
};

const patternOf = (path: string): string | null => {
    if(loaders.has(path)) return path;

    return [...loaders.keys()].find((pattern) => matchPath({ path: pattern, end: true }, path) !== null)
        ?? null;
};

export const prefetchRoute = (path: string): Promise<void> => {
    const pattern = patternOf(path);
    if(pattern === null) return Promise.resolve();

    const pending = requested.get(pattern);
    if(pending) return pending;

    const registered = loaders.get(pattern);
    if(!registered) return Promise.resolve();

    const loading = Promise.all(registered.map((load) => load()))
        .then(() => undefined)
        .catch(() => {
            requested.delete(pattern);
        });

    requested.set(pattern, loading);

    return loading;
};
