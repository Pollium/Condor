import { FunnelErrors } from '@condor/contracts/funnels/errors';
import { copyFor } from '@pollium/readable-react/errors/copy';
import { copy } from '@/modules/funnels/i18n';

export const funnelError = copyFor(FunnelErrors, {
    NotFound: copy.errors.notFound
});
