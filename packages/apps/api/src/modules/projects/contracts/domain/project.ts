import { ProjectSettings } from '@condor/contracts/projects/domain';

export interface IngestProject{
    projectId: string;
    publicKey: string;
    host: string;
    settings: ProjectSettings;
}

export interface ProjectChangedPayload{
    projectId: string;
    publicKeys: string[];
}
