import Project from '../models/Project';
import ProjectService from '../services/Project';
import ProjectStatusService from '../services/ProjectStatus';
import BaseController from '@readable/controllers/BaseController';
import { Controller } from '@readable/decorators/controllers/Controller';
import { Body } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Status } from '@readable/decorators/controllers/Status';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { CreateProjectInput, UpdateProjectInput, UpdateSettingsInput } from '@condor/contracts/projects/http';
import { projectRoutes } from '@condor/contracts/projects/routes';
import { EditorRoute, MemberRoute } from '@/shared/access/role-route';
import { CurrentProject } from '../middlewares/CurrentProject';

@Controller('')
export default class ProjectController extends BaseController{
    #projects = new ProjectService();
    #status = new ProjectStatusService();

    @Route(projectRoutes.list)
    @Middleware(MemberRoute)
    list(){
        return this.#projects.list();
    }

    @Route(projectRoutes.create)
    @Middleware(EditorRoute)
    @Status(201)
    create(@Body() body: CreateProjectInput){
        return this.#projects.create(body);
    }

    @Route(projectRoutes.get)
    @Middleware(MemberRoute)
    get(@CurrentProject() project: Project){
        return project;
    }

    @Route(projectRoutes.update)
    @Middleware(EditorRoute)
    update(@CurrentProject() project: Project, @Body() body: UpdateProjectInput){
        return this.#projects.update(project, body);
    }

    @Route(projectRoutes.updateSettings)
    @Middleware(EditorRoute)
    updateSettings(@CurrentProject() project: Project, @Body() body: UpdateSettingsInput){
        return this.#projects.updateSettings(project, body);
    }

    @Route(projectRoutes.rotateKey)
    @Middleware(EditorRoute)
    rotateKey(@CurrentProject() project: Project){
        return this.#projects.rotateKey(project);
    }

    @Route(projectRoutes.remove)
    @Middleware(EditorRoute)
    remove(@CurrentProject() project: Project){
        return this.#projects.remove(project);
    }

    @Route(projectRoutes.status)
    @Middleware(MemberRoute)
    status(@CurrentProject() project: Project){
        return this.#status.of(project);
    }
}
