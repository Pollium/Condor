import IssueService from '../services/Issue';
import Project from '@/modules/projects/models/Project';
import BaseController, { Controller, Route } from '@pollium/readable/http/Controller';
import { Body, IdParam, Query } from '@pollium/readable/http/params';
import { Middleware } from '@pollium/readable/http/middleware';
import { UpdateIssueInput } from '@condor/contracts/issues/http';
import { issueRoutes } from '@condor/contracts/issues/routes';
import { CurrentProject } from '@/modules/projects/middlewares/CurrentProject';
import { EditorRoute, MemberRoute } from '@/shared/access/role-route';
import { parseChoice, parseText } from '@/shared/http/query-params';
import { parsePeriod } from '@/shared/time/period-window';
import { ISSUE_STATUSES } from '../contracts/domain/issue';

@Controller('')
export default class IssueController extends BaseController{
    #issues = new IssueService();

    @Route(issueRoutes.list)
    @Middleware(MemberRoute)
    list(
        @CurrentProject() project: Project,
        @Query('period') period: string | undefined,
        @Query('status') status: string | undefined,
        @Query('search') search: string | undefined
    ){
        return this.#issues.list(project, {
            period: parsePeriod(period),
            status: parseChoice('status', status, ISSUE_STATUSES, null),
            search: parseText('search', search)
        });
    }

    @Route(issueRoutes.get)
    @Middleware(MemberRoute)
    get(@CurrentProject() project: Project, @IdParam('issueId') issueId: string, @Query('period') period: string | undefined){
        return this.#issues.get(project, issueId, parsePeriod(period));
    }

    @Route(issueRoutes.update)
    @Middleware(EditorRoute)
    update(@CurrentProject() project: Project, @IdParam('issueId') issueId: string, @Body() body: UpdateIssueInput){
        return this.#issues.update(project, issueId, body);
    }
}
