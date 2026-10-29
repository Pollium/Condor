import MemberService from '../services/Member';
import AuthenticatedController from '@readable/auth/AuthenticatedController';
import { CurrentUser } from '@readable/auth/CurrentUser';
import { Body, IdParam } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { UpdateMemberInput } from '@condor/contracts/members/http';
import { memberRoutes } from '@condor/contracts/members/routes';
import { MemberRoute, RoleRoute } from '@/shared/access/role-route';

export default class MemberController extends AuthenticatedController{
    #service = new MemberService();

    @Route(memberRoutes.list)
    @Middleware(MemberRoute)
    list(){
        return this.#service.list();
    }

    @Route(memberRoutes.update)
    @Middleware(RoleRoute('owner'))
    update(@CurrentUser() actorId: string, @IdParam('userId') userId: string, @Body() body: UpdateMemberInput){
        return this.#service.update(actorId, userId, body);
    }

    @Route(memberRoutes.remove)
    @Middleware(RoleRoute('owner'))
    remove(@CurrentUser() actorId: string, @IdParam('userId') userId: string){
        return this.#service.remove(actorId, userId);
    }
}
