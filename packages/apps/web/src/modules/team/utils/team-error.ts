import { AuthErrors } from '@condor/contracts/auth/errors';
import { InvitationErrors, MemberErrors } from '@condor/contracts/members/errors';
import { copyFor } from '@pollium/readable-react/errors/copy';
import { copy } from '@/modules/team/i18n';
import { authFallback } from '@/shared/utils/error-copy';

export const teamError = copyFor(MemberErrors, {
    NotFound: copy.errors.memberNotFound,
    LastOwner: copy.errors.lastOwner,
    CannotChangeSelf: copy.errors.cannotChangeSelf
}).with(
    copyFor(InvitationErrors, {
        NotFound: copy.errors.invitationNotFound,
        Expired: copy.errors.invitationExpired,
        AlreadyMember: copy.errors.alreadyMember
    }),
    copyFor(AuthErrors, { ...authFallback, EmailTaken: copy.errors.emailTaken })
);
