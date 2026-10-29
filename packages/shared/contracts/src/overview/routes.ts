import { get } from '../shared/routing';
import { Breakdown, Engagement, HourCell, LiveSnapshot, Summary, Vital } from './domain';

export const overviewRoutes = {
    summary: get<Summary>('/projects/:projectId/overview/summary'),
    breakdown: get<Breakdown>('/projects/:projectId/overview/breakdown'),
    engagement: get<Engagement>('/projects/:projectId/overview/engagement'),
    hours: get<HourCell[]>('/projects/:projectId/overview/hours'),
    vitals: get<Vital[]>('/projects/:projectId/overview/vitals'),
    live: get<LiveSnapshot>('/projects/:projectId/overview/live')
};
