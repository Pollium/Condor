import { AuthErrors } from '@condor/contracts/auth/errors';
import { InvitationErrors } from '@condor/contracts/members/errors';
import { copyFor } from '@pollium/readable-react/errors/copy';
import { copy } from '@/modules/auth/i18n';
import { authFallback } from '@/shared/utils/error-copy';

export const authError = copyFor(AuthErrors, {
    ...authFallback,
    InvalidCredentials: copy.errors.invalidCredentials,
    SetupClosed: copy.errors.setupClosed
});

export const invitationError = copyFor(InvitationErrors, {
    NotFound: copy.errors.invitationNotFound,
    Expired: copy.errors.invitationExpired,
    AlreadyMember: copy.errors.alreadyMember
});
