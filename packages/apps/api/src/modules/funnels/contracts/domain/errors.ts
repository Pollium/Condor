import { defineErrors } from '@readable/utils/errors/define-errors';
import { FunnelErrors } from '@condor/contracts/funnels/errors';

export const FunnelError = defineErrors(FunnelErrors);
