import PersonDetailService from '../services/PersonDetail';
import ReplayService from '../services/Replay';
import SessionDetailService from '../services/SessionDetail';
import SessionListService from '../services/SessionList';
import Project from '@/modules/projects/models/Project';
import BaseController from '@readable/controllers/BaseController';
import { Page } from '@readable/contracts/params';
import { Controller } from '@readable/decorators/controllers/Controller';
import { IdParam, Pagination } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { sessionRoutes } from '@condor/contracts/sessions/routes';
import { CurrentProject } from '@/modules/projects/middlewares/CurrentProject';
import { MemberRoute } from '@/shared/access/role-route';
import { SessionFilter } from '../contracts/domain/filters';
import { SessionFilters } from '../middlewares/SessionFilters';

@Controller('')
@Middleware(MemberRoute)
export default class SessionController extends BaseController{
    #list = new SessionListService();
    #detail = new SessionDetailService();
    #replays = new ReplayService();
    #people = new PersonDetailService();

    @Route(sessionRoutes.list)
    list(@CurrentProject() project: Project, @SessionFilters() filter: SessionFilter, @Pagination() page: Page){
        return this.#list.list(project, filter, page);
    }

    @Route(sessionRoutes.live)
    live(@CurrentProject() project: Project){
        return this.#list.live(project);
    }

    @Route(sessionRoutes.get)
    get(@CurrentProject() project: Project, @IdParam('sessionId') sessionId: string){
        return this.#detail.get(project, sessionId);
    }

    @Route(sessionRoutes.replay)
    replay(@CurrentProject() project: Project, @IdParam('sessionId') sessionId: string){
        return this.#replays.get(project, sessionId);
    }

    @Route(sessionRoutes.person)
    person(@CurrentProject() project: Project, @IdParam('personId') personId: string){
        return this.#people.get(project, personId);
    }
}
