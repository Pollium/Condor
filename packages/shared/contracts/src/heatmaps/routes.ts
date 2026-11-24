import { get } from '@pollium/readable-contracts/routing';
import { HeatPage, Heatmap } from './domain';

export const heatmapRoutes = {
    pages: get<HeatPage[]>('/projects/:projectId/heatmaps/pages'),
    heatmap: get<Heatmap>('/projects/:projectId/heatmaps')
};
