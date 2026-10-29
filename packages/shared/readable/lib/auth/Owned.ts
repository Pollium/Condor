import { createParamDecorator } from '../decorators/controllers/Params';
import { parseId } from '../utils/controllers/parse-id';
import { principalId } from './principalId';

export interface OwnedResolver<T>{
    getOwned(userId: string, id: string): Promise<T>;
}

export const Owned = <T>(Service: new () => OwnedResolver<T>, param = 'id'): ParameterDecorator =>
    createParamDecorator((req) => {
        const userId = principalId(req);
        const id = parseId((req.params as Record<string, string>)[param]);
        return new Service().getOwned(userId, id);
    });
