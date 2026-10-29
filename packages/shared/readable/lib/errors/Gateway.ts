import { GatewayErrors } from '@condor/contracts/shared/errors';
import { defineErrors } from '../utils/errors/define-errors';

export const GatewayError = defineErrors(GatewayErrors);