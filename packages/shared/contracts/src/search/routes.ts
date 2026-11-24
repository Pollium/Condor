import { get } from '@pollium/readable-contracts/routing';
import { SearchResults } from './domain';

export const searchRoutes = {
    search: get<SearchResults>('/projects/:projectId/search')
};
