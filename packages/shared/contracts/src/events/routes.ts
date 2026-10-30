import { get } from '../shared/routing';
import { EventDetail, EventSummary, PropertyBreakdown, TraitSummary } from './domain';

export const eventRoutes = {
    list: get<EventSummary[]>('/projects/:projectId/events'),
    detail: get<EventDetail>('/projects/:projectId/events/:name'),
    property: get<PropertyBreakdown>('/projects/:projectId/events/:name/properties/:key'),
    traits: get<TraitSummary[]>('/projects/:projectId/traits')
};
