import SearchService from '../services/Search';
import Project from '@/modules/projects/models/Project';
import BaseController from '@readable/controllers/BaseController';
import { Controller } from '@readable/decorators/controllers/Controller';
import { Query } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { searchRoutes } from '@condor/contracts/search/routes';
import { CurrentProject } from '@/modules/projects/middlewares/CurrentProject';
import { MemberRoute } from '@/shared/access/role-route';

@Controller('')
export default class SearchController extends BaseController{
    #search = new SearchService();

    @Route(searchRoutes.search)
    @Middleware(MemberRoute)
    search(@CurrentProject() project: Project, @Query('q') query: string | undefined){
        return this.#search.search(project, query);
    }
}
