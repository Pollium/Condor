import { copy } from '@/modules/team/i18n';
import { errorCopy } from '@/shared/utils/error-copy';

export const teamError = errorCopy({
    'Member::NotFound': copy.errors.memberNotFound,
    'Member::LastOwner': copy.errors.lastOwner,
    'Member::CannotChangeSelf': copy.errors.cannotChangeSelf,
    'Invitation::NotFound': copy.errors.invitationNotFound,
    'Invitation::Expired': copy.errors.invitationExpired,
    'Invitation::AlreadyMember': copy.errors.alreadyMember,
    'Auth::EmailTaken': copy.errors.emailTaken
});
