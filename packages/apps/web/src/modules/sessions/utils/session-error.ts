import { SessionErrors } from '@condor/contracts/sessions/errors';
import { copyFor } from '@pollium/readable-react/errors/copy';
import { copy } from '@/modules/sessions/i18n';
import { copy as shared } from '@/shared/i18n';

export const sessionError = copyFor(SessionErrors, {
    NotFound: copy.errors.notFound,
    NoReplay: shared.errors.unknown,
    PersonNotFound: shared.errors.unknown
});
