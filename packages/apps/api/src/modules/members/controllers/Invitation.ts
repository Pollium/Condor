import InvitationService from '../services/Invitation';
import AuthenticatedController from '@readable/auth/AuthenticatedController';
import { CurrentUser } from '@readable/auth/CurrentUser';
import { Body, IdParam } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Status } from '@readable/decorators/controllers/Status';
import { Middleware } from '@readable/decorators/middleware/Middleware';
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
