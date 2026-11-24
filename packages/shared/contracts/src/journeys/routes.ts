import { get } from '@pollium/readable-contracts/routing';
import { Journey } from './domain';

export const journeyRoutes = {
    journey: get<Journey>('/projects/:projectId/journeys')
};
