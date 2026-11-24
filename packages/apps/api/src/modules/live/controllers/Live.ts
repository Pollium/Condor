import LiveSnapshotService from '../services/LiveSnapshot';
import Project from '@/modules/projects/models/Project';
import BaseController, { Controller, Route } from '@pollium/readable/http/Controller';
import { Middleware } from '@pollium/readable/http/middleware';
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
