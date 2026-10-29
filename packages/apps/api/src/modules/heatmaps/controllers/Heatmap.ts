import HeatmapService from '../services/Heatmap';
import HeatPagesService from '../services/HeatPages';
import Project from '@/modules/projects/models/Project';
import BaseController from '@readable/controllers/BaseController';
import { Controller } from '@readable/decorators/controllers/Controller';
import { Query } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { heatmapRoutes } from '@condor/contracts/heatmaps/routes';
import { CurrentProject } from '@/modules/projects/middlewares/CurrentProject';
import { MemberRoute } from '@/shared/access/role-route';
import { parseChoice, requireText } from '@/shared/http/query-params';
import { parsePeriod } from '@/shared/time/period-window';
import { HEAT_MODES, HEAT_WIDTHS } from '../contracts/domain/heatmap';

@Controller('')
@Middleware(MemberRoute)
export default class HeatmapController extends BaseController{
    #pages = new HeatPagesService();
    #heatmap = new HeatmapService();

    @Route(heatmapRoutes.pages)
    pages(@CurrentProject() project: Project, @Query('period') period: string | undefined){
        return this.#pages.list(project, parsePeriod(period));
    }

    @Route(heatmapRoutes.heatmap)
    heatmap(
        @CurrentProject() project: Project,
        @Query('path') path: string | undefined,
        @Query('mode') mode: string | undefined,
        @Query('width') width: string | undefined,
        @Query('period') period: string | undefined
    ){
        return this.#heatmap.read(project, {
            path: requireText('path', path),
            mode: parseChoice('mode', mode, HEAT_MODES, 'clicks'),
            width: parseChoice('width', width, HEAT_WIDTHS, 'desktop'),
            period: parsePeriod(period)
        });
    }
}
