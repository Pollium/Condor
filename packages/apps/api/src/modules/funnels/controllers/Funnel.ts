import FunnelService from '../services/Funnel';
import FunnelResultsService from '../services/FunnelResults';
import Project from '@/modules/projects/models/Project';
import BaseController from '@readable/controllers/BaseController';
import { Controller } from '@readable/decorators/controllers/Controller';
import { Body, IdParam, Query } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Status } from '@readable/decorators/controllers/Status';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { CreateFunnelInput, UpdateFunnelInput } from '@condor/contracts/funnels/http';
import { funnelRoutes } from '@condor/contracts/funnels/routes';
import { CurrentProject } from '@/modules/projects/middlewares/CurrentProject';
import { EditorRoute, MemberRoute } from '@/shared/access/role-route';
import { parseSegment } from '@/shared/http/segment';
import { IntegerRange, parseInteger } from '@/shared/http/query-params';
import { parsePeriod } from '@/shared/time/period-window';

const WINDOW_HOURS: IntegerRange<null> = {
    min: 1,
    max: 720,
    fallback: null
};

@Controller('')
export default class FunnelController extends BaseController{
    #funnels = new FunnelService();
    #results = new FunnelResultsService();

    @Route(funnelRoutes.list)
    @Middleware(MemberRoute)
    list(@CurrentProject() project: Project){
        return this.#funnels.list(project);
    }

    @Route(funnelRoutes.create)
    @Middleware(EditorRoute)
    @Status(201)
    create(@CurrentProject() project: Project, @Body() body: CreateFunnelInput){
        return this.#funnels.create(project, body);
    }

    @Route(funnelRoutes.update)
    @Middleware(EditorRoute)
    update(@CurrentProject() project: Project, @IdParam('funnelId') funnelId: string, @Body() body: UpdateFunnelInput){
        return this.#funnels.update(project, funnelId, body);
    }

    @Route(funnelRoutes.remove)
    @Middleware(EditorRoute)
    remove(@CurrentProject() project: Project, @IdParam('funnelId') funnelId: string){
        return this.#funnels.remove(project, funnelId);
    }

    @Route(funnelRoutes.results)
    @Middleware(MemberRoute)
    results(
        @CurrentProject() project: Project,
        @IdParam('funnelId') funnelId: string,
        @Query('period') period: string | undefined,
        @Query('windowHours') windowHours: string | undefined,
        @Query('traitKey') traitKey: string | undefined,
        @Query('traitValue') traitValue: string | undefined
    ){
        return this.#results.read(project, funnelId, {
            period: parsePeriod(period),
            windowHours: parseInteger('windowHours', windowHours, WINDOW_HOURS),
            segment: parseSegment(traitKey, traitValue)
        });
    }
}
