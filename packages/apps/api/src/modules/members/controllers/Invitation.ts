import InvitationService from '../services/Invitation';
import { AuthenticatedController } from '@pollium/readable/auth/guards';
import { CurrentUser } from '@pollium/readable/auth/params';
import { Body, IdParam } from '@pollium/readable/http/params';
import { Route, Status } from '@pollium/readable/http/Controller';
import { Middleware } from '@pollium/readable/http/middleware';
import { InviteInput } from '@condor/contracts/members/http';
import { memberRoutes } from '@condor/contracts/members/routes';
import { RoleRoute } from '@/shared/access/role-route';

@Middleware(RoleRoute('owner', 'admin'))
export default class InvitationController extends AuthenticatedController{
    #service = new InvitationService();

    @Route(memberRoutes.invitations)
    invitations(){
        return this.#service.pending();
    }

    @Route(memberRoutes.invite)
    @Status(201)
    invite(@CurrentUser() inviterId: string, @Body() body: InviteInput){
        return this.#service.invite(inviterId, body);
    }

    @Route(memberRoutes.revoke)
    revoke(@IdParam('invitationId') invitationId: string){
        return this.#service.revoke(invitationId);
    }
}
