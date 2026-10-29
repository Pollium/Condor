const prefixByController = new WeakMap<object, string>();

export const Controller = (prefix: string): ClassDecorator => {
    return (target) => {
        prefixByController.set(target, prefix);
    };
};

export const getControllerPrefix = (ctor: object): string | undefined => {
    return prefixByController.get(ctor);
};
