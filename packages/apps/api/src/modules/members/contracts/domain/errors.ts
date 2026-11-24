import { defineErrors } from '@pollium/readable/app/errors';
import { InvitationErrors, MemberErrors } from '@condor/contracts/members/errors';

export const MemberError = defineErrors(MemberErrors);
export const InvitationError = defineErrors(InvitationErrors);
