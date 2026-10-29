import { Button, InlineLoading, InlineNotification, ProgressIndicator, ProgressStep } from '@carbon/react';
import { ingestRoutes } from '@condor/contracts/ingest/routes';
import { WireBatch } from '@condor/contracts/ingest/wire';
import { env } from '@condor/ui/config/env';
import { useLive } from '@/modules/live/hooks/use-live';
import ProjectMark from '@/modules/projects/components/ProjectMark';
import { useProject, useWorkspace } from '@/modules/projects/hooks/use-workspace';
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
            <PageHeader title={project.name} hint={`${platformLabel(project.platform)} · esperando el primer evento`} />
            <div className='flex items-center gap-4'>
                <ProjectMark project={project} size={48} />
                <div>
                    <h2 className='text-[2rem] font-light leading-tight'>Conecta {project.name}</h2>
                    <p className='text-[0.875rem] text-label-2'>
                        {platformLabel(project.platform)} · {project.host}. {web ? 'Instala el SDK y las métricas y grabaciones empiezan a llegar solas.' : 'Envía eventos desde tu backend con una petición HTTP.'}
                    </p>
                </div>
            </div>

            <ProgressIndicator currentIndex={2} spaceEqually>
                <ProgressStep label={web ? 'Instala el SDK' : 'Envía un evento'} />
                <ProgressStep label='Identifica a las personas' secondaryLabel='Opcional' />
                <ProgressStep label='Primer evento' />
            </ProgressIndicator>

            <section className='flex flex-col gap-3'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <h3 className='text-[1rem]'>1. {web ? 'Instala el SDK' : 'Envía eventos por HTTP'}</h3>
                    {web ? (
                        <Segmented label='Instalación' choices={[{ value: 'script', label: 'Script' }, { value: 'npm', label: 'npm' }]} value={install} onChange={setInstall} />
                    ) : null}
                </div>
                <p className='text-[0.875rem] text-label-2'>
                    {!web ? 'Cualquier lenguaje sirve: es un POST con tu clave pública.' : install === 'script' ? 'Pega esto antes de </head> en todas las páginas.' : 'Inicialízalo una vez al arrancar tu app.'}
                </p>
                <Code>{!web ? httpSnippet(origin, project.publicKey) : install === 'script' ? scriptSnippet(origin, project.publicKey) : npmSnippet(origin, project.publicKey)}</Code>
            </section>

            {web ? (
                <section className='flex flex-col gap-3'>
                    <h3 className='text-[1rem]'>2. Identifica a las personas</h3>
                    <p className='text-[0.875rem] text-label-2'>Así cada sesión lleva un nombre y puedes buscarla por correo.</p>
                    <Code>{identifySnippet()}</Code>
                </section>
            ) : null}

            <section className='flex flex-col gap-3'>
                <h3 className='text-[1rem]'>{web ? '3' : '2'}. Primer evento</h3>
                {failed ? <InlineNotification kind='error' lowContrast hideCloseButton title='No llegó el evento de prueba' subtitle='Revisa que el colector esté en marcha y que esta consola lo alcance en /i.' /> : null}
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <InlineLoading description={`Esperando datos de ${project.host}…`} />
                    <Button kind='tertiary' size='md' disabled={testing} onClick={sendTest}>
                        {testing ? 'Enviando…' : 'Enviar evento de prueba'}
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default ConnectApp;
