import EventExplorerService, { ExplorerFilter } from '../services/EventExplorer';
import TraitCatalogService from '../services/TraitCatalog';
import Project from '@/modules/projects/models/Project';
import BaseController from '@readable/controllers/BaseController';
import { Controller } from '@readable/decorators/controllers/Controller';
import { Param, Query } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { eventRoutes } from '@condor/contracts/events/routes';
import { CurrentProject } from '@/modules/projects/middlewares/CurrentProject';
import { MemberRoute } from '@/shared/access/role-route';
import { parseSegment } from '@/shared/http/segment';
import { parsePeriod } from '@/shared/time/period-window';

const filterOf = (query: Record<string, string | undefined>): ExplorerFilter => ({
    period: parsePeriod(query.period),
    segment: parseSegment(query.traitKey, query.traitValue)
});

@Controller('')
@Middleware(MemberRoute)
export default class EventController extends BaseController{
    #explorer = new EventExplorerService();
    #traits = new TraitCatalogService();

    @Route(eventRoutes.list)
    list(@CurrentProject() project: Project, @Query() query: Record<string, string | undefined>){
        return this.#explorer.list(project, filterOf(query));
    }

    @Route(eventRoutes.detail)
    detail(@CurrentProject() project: Project, @Param('name') name: string, @Query() query: Record<string, string | undefined>){
        return this.#explorer.detail(project, name, filterOf(query));
    }

    @Route(eventRoutes.property)
    property(
        @CurrentProject() project: Project,
        @Param('name') name: string,
        @Param('key') key: string,
        @Query() query: Record<string, string | undefined>
    ){
        return this.#explorer.property(project, name, key, filterOf(query));
    }

    @Route(eventRoutes.traits)
    traits(@CurrentProject() project: Project){
        return this.#traits.list(project);
    }
}
