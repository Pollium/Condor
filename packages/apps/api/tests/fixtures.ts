import { ProjectSettings } from '@condor/contracts/projects/domain';
import { IngestProject } from '@/modules/projects/contracts/domain/project';

export const PUBLIC_KEY = 'pk_test_storefront';
export const PROJECT_ID = '0196f1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b';

const SETTINGS: ProjectSettings = {
    recordingEnabled: true,
    sampleRate: 1,
    maskInputs: true,
    maskText: false,
    blockSelector: '',
    respectDnt: true,
    captureConsole: true,
    captureNetwork: false,
    retentionDays: 90,
    routeGroups: ['/products/:slug'],
    conversionEvent: null,
    timezone: 'America/Santiago'
};

export const ingestProject = (settings: Partial<ProjectSettings> = {}): IngestProject => ({
    projectId: PROJECT_ID,
    publicKey: PUBLIC_KEY,
    host: 'shop.example.com',
    settings: { ...SETTINGS, ...settings }
});
