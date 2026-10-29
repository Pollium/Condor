import Invitation from '../../models/Invitation';

export interface IssuedInvitation{
    invitation: Invitation;
    token: string;
}
