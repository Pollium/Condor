import { Project } from '@condor/contracts/projects/domain';
import { copy } from '@/modules/projects/i18n';

export const PLATFORMS = [
    { value: 'web', label: copy.platforms.web },
    { value: 'server', label: copy.platforms.server }
] as const;

export const platformLabel = (platform: Project['platform']): string =>
    PLATFORMS.find((entry) => entry.value === platform)?.label ?? copy.platforms.web;

export const scriptSnippet = (origin: string, key: string): string =>
    `<script defer src="${origin}/i/condor.js" data-key="${key}"></script>`;

export const npmSnippet = (origin: string, key: string): string =>
    `npm install @condor/browser\n\nimport { condor } from '@condor/browser';\n\ncondor.init({ key: '${key}', host: '${origin}' });`;

export const identifySnippet = (): string =>
    `condor.identify(user.id, { email: user.email, name: user.name });\ncondor.track('signup_completed', { plan: 'pro' });`;

export const httpSnippet = (origin: string, key: string): string => [
    `curl -X POST ${origin}/i/batch \\`,
    `  -H 'content-type: application/json' \\`,
    `  -d '{`,
    `    "key": "${key}",`,
    `    "sdk": { "name": "http", "version": "1" },`,
    `    "sentAt": '$(date +%s000)',`,
    `    "anonymousId": "user-42",`,
    `    "userId": "user-42",`,
    `    "context": {},`,
    `    "events": [{ "type": "custom", "name": "invoice_paid", "id": "'$(uuidgen)'", "timestamp": '$(date +%s000)', "path": "/api/invoices", "props": { "value": 120 } }]`,
    `  }'`
].join('\n');
