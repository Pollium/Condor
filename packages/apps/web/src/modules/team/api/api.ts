import { memberRoutes } from '@condor/contracts/members/routes';
import { InviteInput, UpdateMemberInput } from '@condor/contracts/members/http';
import { call } from '@condor/ui/api/call';

export const teamApi = {
    members: () => call(memberRoutes.list, { fresh: true }),
    update: (userId: string, body: UpdateMemberInput) => call(memberRoutes.update, { path: { userId }, body }),
    remove: (userId: string) => call(memberRoutes.remove, { path: { userId } }),
    invitations: () => call(memberRoutes.invitations, { fresh: true }),
    invite: (body: InviteInput) => call(memberRoutes.invite, { body }),
    revoke: (invitationId: string) => call(memberRoutes.revoke, { path: { invitationId } })
};
