import { RequestErrors } from '@condor/contracts/shared/errors';
import { defineErrors } from '../utils/errors/define-errors';

export const RequestError = defineErrors(RequestErrors);
