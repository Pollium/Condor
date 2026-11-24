import { get } from '@pollium/readable-contracts/routing';
import { Retention } from './domain';

export const retentionRoutes = {
    retention: get<Retention>('/projects/:projectId/retention')
};
