import Project from '../models/Project';
import { createParamDecorator, parseId } from '@pollium/readable/http/params';
import { findOrThrow } from '@pollium/readable/database/queries';
import { ProjectError } from '../contracts/domain/errors';

export const CurrentProject = (): ParameterDecorator => createParamDecorator((req) => {
    const id = parseId((req.params as Record<string, string | undefined>).projectId);
    return findOrThrow(Project, { id }, () => ProjectError.NotFound());
});
