import { Workspace } from '@/modules/projects/contracts/workspace';
import { defineErrors } from '@condor/ui/errors/define-errors';
import { createContext, useContext } from 'react';

const WorkspaceError = defineErrors({
    domain: 'Workspace',
    causes: {
        MissingProvider: 500,
        NoProject: 500
    }
} as const);

export const WorkspaceContext = createContext<Workspace | null>(null);

export const useWorkspace = (): Workspace => {
    const workspace = useContext(WorkspaceContext);
    if(workspace === null) throw WorkspaceError.MissingProvider();
    return workspace;
};

export const useProject = () => {
    const { project } = useWorkspace();
    if(project === null) throw WorkspaceError.NoProject();
    return project;
};
