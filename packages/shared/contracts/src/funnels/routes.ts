import { del, get, patch, post } from '../shared/routing';
import { Funnel, FunnelResult } from './domain';
import { CreateFunnelInput, UpdateFunnelInput } from './http';

export const funnelRoutes = {
    list: get<Funnel[]>('/projects/:projectId/funnels'),
    create: post<CreateFunnelInput, Funnel>('/projects/:projectId/funnels'),
    update: patch<UpdateFunnelInput, Funnel>('/projects/:projectId/funnels/:funnelId'),
    remove: del('/projects/:projectId/funnels/:funnelId'),
    results: get<FunnelResult>('/projects/:projectId/funnels/:funnelId/results')
};
