import LiveSnapshotService from '../services/LiveSnapshot';
import Project from '@/modules/projects/models/Project';
import BaseController from '@readable/controllers/BaseController';
import { Controller } from '@readable/decorators/controllers/Controller';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { overviewRoutes } from '@condor/contracts/overview/routes';
import { CurrentProject } from '@/modules/projects/middlewares/CurrentProject';
import { MemberRoute } from '@/shared/access/role-route';

@Controller('')
export default class LiveController extends BaseController{
    #snapshots = new LiveSnapshotService();

    @Route(overviewRoutes.live)
    @Middleware(MemberRoute)
    live(@CurrentProject() project: Project){
        return this.#snapshots.of(project.id);
    }
}
