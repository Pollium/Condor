import { get } from '../shared/routing';
import { Journey } from './domain';

export const journeyRoutes = {
    journey: get<Journey>('/projects/:projectId/journeys')
};
