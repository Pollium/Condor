import { Project } from '@condor/contracts/projects/domain';
import { UpdateProjectInput, UpdateSettingsInput } from '@condor/contracts/projects/http';
import { projectRoutes } from '@condor/contracts/projects/routes';
import { describeError } from '@pollium/readable-react/errors/copy';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { useProject, useWorkspace } from '@/modules/projects/hooks/use-workspace';
import { useEffect, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const useSaveProject = () => {
    const project = useProject();
    const { replace } = useWorkspace();
    const path = { projectId: project.id };
    const updateSettings = useMutation(projectRoutes.updateSettings, { path });
    const update = useMutation(projectRoutes.update, { path });
    const rotateKey = useMutation(projectRoutes.rotateKey, { path });
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
            setError(describeError(cause instanceof Error ? cause : undefined));
            return false;
        }
    };

    return {
        status,
        error,
        settings: (body: UpdateSettingsInput) => commit(() => updateSettings.run({ body })),
        details: (body: UpdateProjectInput) => commit(() => update.run({ body })),
        rotate: () => commit(() => rotateKey.run())
    };
};
