import { Button, InlineLoading, InlineNotification, ProgressIndicator, ProgressStep } from '@carbon/react';
import { ingestRoutes } from '@condor/contracts/ingest/routes';
import { WireBatch } from '@condor/contracts/ingest/wire';
import { env } from '@condor/ui/config/env';
import { useLive } from '@/modules/live/hooks/use-live';
import ProjectMark from '@/modules/projects/components/ProjectMark';
import { useProject, useWorkspace } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { httpSnippet, identifySnippet, npmSnippet, platformLabel, scriptSnippet } from '@/modules/projects/utils/snippets';
import Code from '@/shared/components/Code';
import { PageHeader } from '@/shared/components/Page';
import Segmented from '@/shared/components/Segmented';
import { useEffect, useState } from 'react';

type Install = 'script' | 'npm';

const testBatch = (key: string): WireBatch => ({
    key,
    sdk: { name: 'condor-console', version: '1' },
    sentAt: Date.now(),
    anonymousId: 'condor-console-test',
    userId: null,
    context: {},
    events: [{ type: 'custom', name: 'condor_connection_test', id: crypto.randomUUID(), timestamp: Date.now(), path: '/' }]
});

const ConnectApp = () => {
    const project = useProject();
    const { reload } = useWorkspace();
    const live = useLive(project.id);
    const [install, setInstall] = useState<Install>('script');
    const [testing, setTesting] = useState(false);
    const [failed, setFailed] = useState(false);
    const origin = env.ingestUrl;
    const web = project.platform === 'web';

    useEffect(() => {
        if(live !== null && live.count > 0) reload();
    }, [live, reload]);

    const sendTest = async () => {
        setTesting(true);
        setFailed(false);
        const response = await fetch(`${origin}${ingestRoutes.batch.path}`, {
            method: 'POST',
            headers: { 'content-type': 'text/plain' },
            body: JSON.stringify(testBatch(project.publicKey))
        }).catch(() => null);
        setTesting(false);
        if(response === null || !response.ok){
            setFailed(true);
            return;
        }
        window.setTimeout(reload, 1500);
    };

    return (
        <div className='mx-auto flex w-full max-w-3xl flex-col gap-8 py-6'>
            <PageHeader title={project.name} hint={copy.connect.hint(platformLabel(project.platform))} />
            <div className='flex items-center gap-4'>
                <ProjectMark project={project} size={48} />
                <div>
                    <h2 className='text-[2rem] font-light leading-tight'>{copy.connect.title(project.name)}</h2>
                    <p className='text-[0.875rem] text-label-2'>
                        {platformLabel(project.platform)} · {project.host}. {web ? copy.connect.webLead : copy.connect.serverLead}
                    </p>
                </div>
            </div>

            <ProgressIndicator currentIndex={2} spaceEqually>
                <ProgressStep label={web ? copy.connect.installStep : copy.connect.sendStep} />
                <ProgressStep label={copy.connect.identifyStep} secondaryLabel={copy.connect.optional} />
                <ProgressStep label={copy.connect.firstEvent} />
            </ProgressIndicator>

            <section className='flex flex-col gap-3'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <h3 className='text-[1rem]'>1. {web ? copy.connect.installStep : copy.connect.httpStep}</h3>
                    {web ? (
                        <Segmented label={copy.connect.install} choices={[{ value: 'script', label: 'Script' }, { value: 'npm', label: 'npm' }]} value={install} onChange={setInstall} />
                    ) : null}
                </div>
                <p className='text-[0.875rem] text-label-2'>
                    {!web ? copy.connect.httpNote : install === 'script' ? copy.connect.scriptNote : copy.connect.npmNote}
                </p>
                <Code>{!web ? httpSnippet(origin, project.publicKey) : install === 'script' ? scriptSnippet(origin, project.publicKey) : npmSnippet(origin, project.publicKey)}</Code>
            </section>

            {web ? (
                <section className='flex flex-col gap-3'>
                    <h3 className='text-[1rem]'>2. {copy.connect.identifyStep}</h3>
                    <p className='text-[0.875rem] text-label-2'>{copy.connect.identifyNote}</p>
                    <Code>{identifySnippet()}</Code>
                </section>
            ) : null}

            <section className='flex flex-col gap-3'>
                <h3 className='text-[1rem]'>{web ? '3' : '2'}. {copy.connect.firstEvent}</h3>
                {failed ? <InlineNotification kind='error' lowContrast hideCloseButton title={copy.connect.testFailed} subtitle={copy.connect.testFailedHint} /> : null}
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <InlineLoading description={copy.connect.waiting(project.host)} />
                    <Button kind='tertiary' size='md' disabled={testing} onClick={sendTest}>
                        {testing ? copy.connect.sending : copy.connect.sendTest}
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default ConnectApp;
