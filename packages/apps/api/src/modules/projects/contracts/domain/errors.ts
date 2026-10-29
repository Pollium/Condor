import { defineErrors } from '@readable/utils/errors/define-errors';
import { ProjectErrors } from '@condor/contracts/projects/errors';

export const ProjectError = defineErrors(ProjectErrors);
