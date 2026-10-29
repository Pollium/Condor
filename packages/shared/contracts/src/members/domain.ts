import { BaseEntity } from '../shared/base';
import { Role } from '../auth/domain';

export type InvitedRole = Exclude<Role, 'owner'>;

export interface Member extends BaseEntity{
    email: string;
    name: string;
    role: Role;
    lastSignInAt: string | null;
}

export interface Invitation extends BaseEntity{
    email: string;
    role: InvitedRole;
    invitedBy: string;
    expiresAt: string;
}

export interface CreatedInvitation{
    invitation: Invitation;
    token: string;
}

export interface InvitationPreview{
    email: string;
    role: InvitedRole;
    invitedBy: string;
    expiresAt: string;
}
