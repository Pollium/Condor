import { defineErrors } from '@pollium/readable/app/errors';
import { ProjectErrors } from '@condor/contracts/projects/errors';

export const ProjectError = defineErrors(ProjectErrors);
