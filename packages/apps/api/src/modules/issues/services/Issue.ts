import Issue from '../models/Issue';
import IssueActivityQuery from './IssueActivity';
import Project from '@/modules/projects/models/Project';
import { findOrThrow } from '@readable/utils/models/find-or-throw';
import { IssueState } from '@condor/contracts/issues/domain';
import { UpdateIssueInput } from '@condor/contracts/issues/http';
import { Period } from '@condor/contracts/shared/period';
import { PeriodWindow, resolveWindow } from '@/shared/time/period-window';
import { IssueError } from '../contracts/domain/errors';
import { IssueActivity, IssueDetailView, IssueListFilter, IssueSummary } from '../contracts/domain/issue';

const LIST_LIMIT = 200;
const UPDATED_PERIOD: Period = '7d';

const likePattern = (search: string): string => `%${search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;

export default class IssueService{
    #activity = new IssueActivityQuery();

    async list(project: Project, filter: IssueListFilter): Promise<IssueSummary[]>{
        const window = await this.#window(project, filter.period);
        const query = Issue.createQueryBuilder('issue')
            .where('issue.projectId = :projectId', { projectId: project.id })
            .andWhere('issue.lastSeenAt >= :from', { from: window.from })
            .orderBy('issue.lastSeenAt', 'DESC')
            .take(LIST_LIMIT);
        if(filter.status !== null){
            query.andWhere('issue.status = :status', { status: filter.status });
        }
        if(filter.search !== null){
            query.andWhere('(issue.message ILIKE :pattern OR issue.errorType ILIKE :pattern OR issue.source ILIKE :pattern)', {
                pattern: likePattern(filter.search)
            });
        }
        const issues = await query.getMany();

        const activity = await this.#activity.inWindow(project.id, issues.map((issue) => issue.id), window);
        return issues.map((issue) => this.#summary(issue, window, activity.get(issue.id)));
    }

    async get(project: Project, issueId: string, period: Period): Promise<IssueDetailView>{
        const issue = await this.#find(project, issueId);
        const [window, day] = await Promise.all([this.#window(project, period), this.#window(project, '24h')]);
        const [activity, hourly, recentSessions] = await Promise.all([
            this.#activity.inWindow(project.id, [issue.id], window),
            this.#activity.inWindow(project.id, [issue.id], day),
            this.#activity.recentSessions(project.id, issue.id)
        ]);

        return {
            ...this.#summary(issue, window, activity.get(issue.id)),
            stack: issue.stack,
            hourly: hourly.get(issue.id)?.trend ?? [],
            recentSessions
        };
    }

    async update(project: Project, issueId: string, input: UpdateIssueInput): Promise<IssueSummary>{
        const issue = await this.#find(project, issueId);
        issue.status = input.status;
        if(input.status === 'resolved'){
            issue.resolvedAt = new Date();
        }
        if(input.status === 'open'){
            issue.resolvedAt = null;
            issue.regressedAt = null;
        }
        await issue.save();

        const window = await this.#window(project, UPDATED_PERIOD);
        const activity = await this.#activity.inWindow(project.id, [issue.id], window);
        return this.#summary(issue, window, activity.get(issue.id));
    }

    #find(project: Project, issueId: string): Promise<Issue>{
        return findOrThrow(Issue, { id: issueId, projectId: project.id }, () => IssueError.NotFound());
    }

    #window(project: Project, period: Period): Promise<PeriodWindow>{
        return resolveWindow(Issue.getRepository().manager, period, project.settings.timezone);
    }

    #state(issue: Issue, window: PeriodWindow): IssueState{
        if(issue.status !== 'open') return issue.status;
        if(issue.firstSeenAt >= window.from) return 'new';
        if(issue.regressedAt !== null) return 'regressed';
        return 'open';
    }

    #summary(issue: Issue, window: PeriodWindow, activity: IssueActivity | undefined): IssueSummary{
        return {
            id: issue.id,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            projectId: issue.projectId,
            fingerprint: issue.fingerprint,
            errorType: issue.errorType,
            message: issue.message,
            source: issue.source,
            status: issue.status,
            state: this.#state(issue, window),
            occurrences: issue.occurrences,
            sessions: activity?.sessions ?? 0,
            people: activity?.people ?? 0,
            firstSeenAt: issue.firstSeenAt,
            lastSeenAt: issue.lastSeenAt,
            firstRelease: issue.firstRelease,
            lastRelease: issue.lastRelease,
            trend: activity?.trend ?? []
        };
    }
}
