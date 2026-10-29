import { Role } from '../auth/domain';
import { InvitedRole } from './domain';

export interface InviteInput{
    /** @format email */
    email: string;
    role: InvitedRole;
}

export interface UpdateMemberInput{
    role: Role;
}

export interface AcceptInvitationInput{
    /** @minLength 1 */
    token: string;
    /**
     * @minLength 1
     * @maxLength 80
     */
    name: string;
    /**
     * @minLength 8
     * @maxLength 200
     */
    password: string;
}
