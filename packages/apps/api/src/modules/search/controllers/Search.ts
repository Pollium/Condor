import SearchService from '../services/Search';
import Project from '@/modules/projects/models/Project';
import BaseController, { Controller, Route } from '@pollium/readable/http/Controller';
import { Query } from '@pollium/readable/http/params';
import { Middleware } from '@pollium/readable/http/middleware';
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
