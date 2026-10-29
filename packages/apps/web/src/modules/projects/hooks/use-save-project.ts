import { Project } from '@condor/contracts/projects/domain';
import { UpdateProjectInput, UpdateSettingsInput } from '@condor/contracts/projects/http';
import { projectsApi } from '@/modules/projects/api/api';
import { useProject, useWorkspace } from '@/modules/projects/hooks/use-workspace';
import { errorCopy } from '@/shared/utils/error-copy';
import { useEffect, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const copy = errorCopy();

export const useSaveProject = () => {
    const project = useProject();
    const { replace } = useWorkspace();
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(status !== 'saved') return;
        const timer = window.setTimeout(() => setStatus('idle'), 1800);
        return () => window.clearTimeout(timer);
    }, [status]);

    const commit = async (request: () => PromiseLike<Project>): Promise<boolean> => {
        setStatus('saving');
        setError(null);
        try{
            replace(await request());
            setStatus('saved');
            return true;
        }catch(cause){
            setStatus('error');
            setError(copy(cause instanceof Error ? cause : undefined));
            return false;
        }
    };

    return {
        status,
        error,
        settings: (body: UpdateSettingsInput) => commit(() => projectsApi.updateSettings(project.id, body)),
        details: (body: UpdateProjectInput) => commit(() => projectsApi.update(project.id, body)),
        rotate: () => commit(() => projectsApi.rotateKey(project.id))
    };
};
