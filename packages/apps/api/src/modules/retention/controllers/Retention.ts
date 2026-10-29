import RetentionService from '../services/Retention';
import Project from '@/modules/projects/models/Project';
import BaseController from '@readable/controllers/BaseController';
import { Controller } from '@readable/decorators/controllers/Controller';
import { Query } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { retentionRoutes } from '@condor/contracts/retention/routes';
import { CurrentProject } from '@/modules/projects/middlewares/CurrentProject';
import { MemberRoute } from '@/shared/access/role-route';
import { IntegerRange, parseChoice, parseInteger, parseText } from '@/shared/http/query-params';
import { RETENTION_GRAINS } from '../contracts/domain/retention';

const COHORTS: IntegerRange = {
    min: 1,
    max: 52,
    fallback: 8
};

@Controller('')
@Middleware(MemberRoute)
export default class RetentionController extends BaseController{
    #retention = new RetentionService();

    @Route(retentionRoutes.retention)
    retention(
        @CurrentProject() project: Project,
        @Query('grain') grain: string | undefined,
        @Query('cohorts') cohorts: string | undefined,
        @Query('returnEvent') returnEvent: string | undefined
    ){
        return this.#retention.read(project, {
            grain: parseChoice('grain', grain, RETENTION_GRAINS, 'week'),
            cohorts: parseInteger('cohorts', cohorts, COHORTS),
            returnEvent: parseText('returnEvent', returnEvent)
        });
    }
}
