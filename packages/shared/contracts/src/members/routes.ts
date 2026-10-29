import { del, get, patch, post } from '../shared/routing';
import { AuthSession } from '../auth/domain';
import { CreatedInvitation, Invitation, InvitationPreview, Member } from './domain';
import { AcceptInvitationInput, InviteInput, UpdateMemberInput } from './http';

export const memberRoutes = {
    list: get<Member[]>('/members'),
    update: patch<UpdateMemberInput, Member>('/members/:userId'),
    remove: del('/members/:userId'),
    invitations: get<Invitation[]>('/members/invitations'),
    invite: post<InviteInput, CreatedInvitation>('/members/invitations'),
    revoke: del('/members/invitations/:invitationId'),
    preview: get<InvitationPreview>('/members/invitations/token/:token'),
    accept: post<AcceptInvitationInput, AuthSession>('/members/invitations/accept')
};
