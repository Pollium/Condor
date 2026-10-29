import { RateLimitErrors } from '@condor/contracts/shared/errors';
import { defineErrors } from '../utils/errors/define-errors';

export const RateLimitError = defineErrors(RateLimitErrors);