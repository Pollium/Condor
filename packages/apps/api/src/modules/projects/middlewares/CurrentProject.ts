import Project from '../models/Project';
import { createParamDecorator } from '@readable/decorators/controllers/Params';
import { parseId } from '@readable/utils/controllers/parse-id';
import { findOrThrow } from '@readable/utils/models/find-or-throw';
import { ProjectError } from '../contracts/domain/errors';

export const CurrentProject = (): ParameterDecorator => createParamDecorator((req) => {
    const id = parseId((req.params as Record<string, string | undefined>).projectId);
    return findOrThrow(Project, { id }, () => ProjectError.NotFound());
});
