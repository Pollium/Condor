import InvitationService from '../services/Invitation';
import BaseController, { Route, Status } from '@pollium/readable/http/Controller';
import { Body, Param } from '@pollium/readable/http/params';
import { AcceptInvitationInput } from '@condor/contracts/members/http';
import { memberRoutes } from '@condor/contracts/members/routes';

export default class InvitationLinkController extends BaseController{
    #service = new InvitationService();

    @Route(memberRoutes.preview)
    preview(@Param('token') token: string){
        return this.#service.preview(token);
    }

    @Route(memberRoutes.accept)
    @Status(201)
    accept(@Body() body: AcceptInvitationInput){
        return this.#service.accept(body);
    }
}
