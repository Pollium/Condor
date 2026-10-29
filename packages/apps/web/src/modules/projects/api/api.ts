import { overviewRoutes } from '@condor/contracts/overview/routes';
import { projectRoutes } from '@condor/contracts/projects/routes';
import { CreateProjectInput, UpdateProjectInput, UpdateSettingsInput } from '@condor/contracts/projects/http';
import { call } from '@condor/ui/api/call';

export const projectsApi = {
    list: () => call(projectRoutes.list, { fresh: true }),
    create: (body: CreateProjectInput) => call(projectRoutes.create, { body }),
    update: (projectId: string, body: UpdateProjectInput) => call(projectRoutes.update, { path: { projectId }, body }),
    updateSettings: (projectId: string, body: UpdateSettingsInput) => call(projectRoutes.updateSettings, { path: { projectId }, body }),
    rotateKey: (projectId: string) => call(projectRoutes.rotateKey, { path: { projectId } }),
    remove: (projectId: string) => call(projectRoutes.remove, { path: { projectId } }),
    status: (projectId: string) => call(projectRoutes.status, { path: { projectId }, fresh: true }),
    events: (projectId: string) => call(overviewRoutes.breakdown, { path: { projectId }, query: { dimension: 'event', period: '90d', limit: 50 } })
};
