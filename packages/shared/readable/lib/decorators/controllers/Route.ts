import ClassMetadata from '../../utils/ClassMetadata';
import { Endpoint } from '@condor/contracts/shared/routing';
import { HttpMethod, RouteDefinition, RouteOptions } from '../../contracts/routing';

export const routesByController = new ClassMetadata<RouteDefinition>();

export const Route = <I, O>(
    route: string | Endpoint<I, O>,
    methodOrOptions: string | RouteOptions = 'GET'
): MethodDecorator => {
    return (target, handlerName) => {
        const options: RouteOptions = typeof methodOrOptions === 'string'
            ? { method: methodOrOptions }
            : methodOrOptions;

        const definition = typeof route === 'string'
            ? { path: route, method: (options.method ?? 'GET').toUpperCase() as HttpMethod, absolute: false }
            : { path: route.path, method: route.method, absolute: true };

        routesByController.append(target.constructor, {
            ...definition,
            wrap: options.wrap ?? true,
            bodyLimit: options.bodyLimit,
            handlerName
        });
    };
};
