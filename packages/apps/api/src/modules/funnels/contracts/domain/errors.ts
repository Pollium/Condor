import { defineErrors } from '@pollium/readable/app/errors';
import { FunnelErrors } from '@condor/contracts/funnels/errors';

export const FunnelError = defineErrors(FunnelErrors);
