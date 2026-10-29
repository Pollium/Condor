import { searchRoutes } from '@condor/contracts/search/routes';
import { call } from '@condor/ui/api/call';

export const searchApi = {
    search: (projectId: string, q: string) => call(searchRoutes.search, { path: { projectId }, query: { q } })
};
