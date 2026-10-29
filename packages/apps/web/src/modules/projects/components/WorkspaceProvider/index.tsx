import { Project } from '@condor/contracts/projects/domain';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { projectsApi } from '@/modules/projects/api/api';
import { WorkspaceContext } from '@/modules/projects/hooks/use-workspace';
import { rememberProject } from '@/modules/projects/utils/last-project';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const projectIdOf = (pathname: string): string | null => {
    const id = matchPath({ path: '/:projectId/*' }, pathname)?.params.projectId ?? null;
    return id !== null && UUID.test(id) ? id : null;
};

const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
    const { pathname } = useLocation();
    const query = useQuery(projectsApi.list, []);
    const [replaced, setReplaced] = useState<Record<string, Project>>({});
    const [adding, setAdding] = useState(false);
    const projectId = projectIdOf(pathname);

    const projects = useMemo(
        () => (query.data ?? []).map((entry) => replaced[entry.id] && replaced[entry.id].updatedAt >= entry.updatedAt ? replaced[entry.id] : entry),
        [query.data, replaced]
    );
    const project = projects.find((entry) => entry.id === projectId) ?? null;

    useEffect(() => {
        if(project !== null) rememberProject(project.id);
    }, [project]);

    const workspace = {
        projects,
        project,
        loading: query.loading,
        error: query.error,
        reload: query.reload,
        replace: (next: Project) => setReplaced((current) => ({ ...current, [next.id]: next })),
        adding,
        setAdding
    };

    return <WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>;
};

export default WorkspaceProvider;
