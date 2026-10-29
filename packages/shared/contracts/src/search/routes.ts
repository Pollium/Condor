import { get } from '../shared/routing';
import { SearchResults } from './domain';

export const searchRoutes = {
    search: get<SearchResults>('/projects/:projectId/search')
};
