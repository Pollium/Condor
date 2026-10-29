import InvitationService from '../services/Invitation';
import BaseController from '@readable/controllers/BaseController';
import { Body, Param } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Status } from '@readable/decorators/controllers/Status';
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
