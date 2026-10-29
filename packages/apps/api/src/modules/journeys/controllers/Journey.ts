import JourneyService from '../services/Journey';
import Project from '@/modules/projects/models/Project';
import BaseController from '@readable/controllers/BaseController';
import { Controller } from '@readable/decorators/controllers/Controller';
import { Query } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { journeyRoutes } from '@condor/contracts/journeys/routes';
import { CurrentProject } from '@/modules/projects/middlewares/CurrentProject';
import { MemberRoute } from '@/shared/access/role-route';
import { IntegerRange, parseChoice, parseInteger, parseText } from '@/shared/http/query-params';
import { parsePeriod } from '@/shared/time/period-window';

const STEPS: IntegerRange = {
    min: 3,
    max: 6,
    fallback: 4
};

const FLAGS = ['true', 'false'] as const;

@Controller('')
@Middleware(MemberRoute)
export default class JourneyController extends BaseController{
    #journeys = new JourneyService();

    @Route(journeyRoutes.journey)
    journey(
        @CurrentProject() project: Project,
        @Query('period') period: string | undefined,
        @Query('steps') steps: string | undefined,
        @Query('start') start: string | undefined,
        @Query('exits') exits: string | undefined
    ){
        return this.#journeys.read(project, {
            period: parsePeriod(period),
            steps: parseInteger('steps', steps, STEPS),
            start: parseText('start', start),
            exits: parseChoice('exits', exits, FLAGS, 'false') === 'true'
        });
    }
}
