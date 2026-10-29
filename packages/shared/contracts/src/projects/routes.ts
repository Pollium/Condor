import { del, get, patch, post } from '../shared/routing';
import { Project, ProjectStatus } from './domain';
import { CreateProjectInput, UpdateProjectInput, UpdateSettingsInput } from './http';

export const projectRoutes = {
    list: get<Project[]>('/projects'),
    create: post<CreateProjectInput, Project>('/projects'),
    get: get<Project>('/projects/:projectId'),
    update: patch<UpdateProjectInput, Project>('/projects/:projectId'),
    updateSettings: patch<UpdateSettingsInput, Project>('/projects/:projectId/settings'),
    rotateKey: post<void, Project>('/projects/:projectId/key'),
    remove: del('/projects/:projectId'),
    status: get<ProjectStatus>('/projects/:projectId/status')
};
