import BreakdownService from '../services/breakdown/Breakdown';
import EngagementService from '../services/Engagement';
import HoursService from '../services/Hours';
import SummaryService from '../services/Summary';
import VitalsService from '../services/Vitals';
import Project from '@/modules/projects/models/Project';
import BaseController from '@readable/controllers/BaseController';
import { Controller } from '@readable/decorators/controllers/Controller';
import { Query } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { DIMENSIONS } from '@condor/contracts/overview/domain';
import { overviewRoutes } from '@condor/contracts/overview/routes';
import { CurrentProject } from '@/modules/projects/middlewares/CurrentProject';
import { MemberRoute } from '@/shared/access/role-route';
import { IntegerRange, parseInteger, requireChoice } from '@/shared/http/query-params';
import { parsePeriod } from '@/shared/time/period-window';

const BREAKDOWN_LIMIT: IntegerRange = {
    min: 1,
    max: 100,
    fallback: 10
};

@Controller('')
@Middleware(MemberRoute)
export default class OverviewController extends BaseController{
    #summary = new SummaryService();
    #breakdown = new BreakdownService();
    #engagement = new EngagementService();
    #hours = new HoursService();
    #vitals = new VitalsService();

    @Route(overviewRoutes.summary)
    summary(@CurrentProject() project: Project, @Query('period') period: string | undefined){
        return this.#summary.read(project, parsePeriod(period));
    }

    @Route(overviewRoutes.breakdown)
    breakdown(
        @CurrentProject() project: Project,
        @Query('period') period: string | undefined,
        @Query('dimension') dimension: string | undefined,
        @Query('limit') limit: string | undefined
    ){
        return this.#breakdown.read(project, {
            period: parsePeriod(period),
            dimension: requireChoice('dimension', dimension, DIMENSIONS),
            limit: parseInteger('limit', limit, BREAKDOWN_LIMIT)
        });
    }

    @Route(overviewRoutes.engagement)
    engagement(@CurrentProject() project: Project, @Query('period') period: string | undefined){
        return this.#engagement.read(project, parsePeriod(period));
    }

    @Route(overviewRoutes.hours)
    hours(@CurrentProject() project: Project, @Query('period') period: string | undefined){
        return this.#hours.read(project, parsePeriod(period));
    }

    @Route(overviewRoutes.vitals)
    vitals(@CurrentProject() project: Project, @Query('period') period: string | undefined){
        return this.#vitals.read(project, parsePeriod(period));
    }
}
