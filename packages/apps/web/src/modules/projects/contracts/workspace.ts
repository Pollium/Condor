import { Project } from '@condor/contracts/projects/domain';

export interface Workspace{
    projects: Project[];
    project: Project | null;
    loading: boolean;
    error: Error | undefined;
    reload: () => void;
    replace: (project: Project) => void;
    adding: boolean;
    setAdding: (adding: boolean) => void;
}
