import ClassMetadata from '../../utils/ClassMetadata';
import { MiddlewareBinding, MiddlewareFn } from '../../contracts/middleware';

export type { MiddlewareFn };

const bindingsByController = new ClassMetadata<MiddlewareBinding>();

const bindingsOf = (ctor: object): MiddlewareBinding[] => {
    const parent: unknown = Object.getPrototypeOf(ctor);
    if(typeof parent !== 'function' || parent === Function.prototype) return bindingsByController.get(ctor);

    return [...bindingsOf(parent), ...bindingsByController.get(ctor)];
};

export const Middleware = (...middleware: MiddlewareFn[]): ClassDecorator & MethodDecorator => {
    return (target: object, handlerName?: string | symbol) => {
        const ctor = handlerName === undefined ? target : target.constructor;

        for(const fn of middleware){
            bindingsByController.append(ctor, {
                handlerName: handlerName ?? null,
                middleware: fn
            });
        }
    };
};

export const getMiddleware = (ctor: object, handlerName: string | symbol): MiddlewareFn[] => {
    const bindings = bindingsOf(ctor);

    return bindings
        .filter((binding: MiddlewareBinding) => binding.handlerName === null || binding.handlerName === handlerName)
        .sort((a, b) => Number(a.handlerName !== null) - Number(b.handlerName !== null))
        .map((binding) => binding.middleware);
};

export const getClassMiddleware = (ctor: object): MiddlewareFn[] => {
    return bindingsOf(ctor)
        .filter((binding) => binding.handlerName === null)
        .map((binding) => binding.middleware);
};
