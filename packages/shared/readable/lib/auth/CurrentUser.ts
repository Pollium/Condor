import { createParamDecorator } from '../decorators/controllers/Params';
import { principalId } from './principalId';

export const CurrentUser = (): ParameterDecorator => createParamDecorator(principalId);
