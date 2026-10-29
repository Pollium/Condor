import { get } from '../shared/routing';
import { Retention } from './domain';

export const retentionRoutes = {
    retention: get<Retention>('/projects/:projectId/retention')
};
