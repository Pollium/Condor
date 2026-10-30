import { Button, ButtonSet, Form, InlineNotification, TextInput } from '@carbon/react';
import { Platform } from '@condor/contracts/projects/domain';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { projectsApi } from '@/modules/projects/api/api';
import { useWorkspace } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { PLATFORMS } from '@/modules/projects/utils/snippets';
import Modal from '@/shared/components/Modal';
import Segmented from '@/shared/components/Segmented';
import { errorCopy } from '@/shared/utils/error-copy';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const createError = errorCopy();

const cleanHost = (host: string): string => host.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

const AddApp = () => {
    const navigate = useNavigate();
    const { adding, setAdding, reload, replace } = useWorkspace();
    const create = useMutation(projectsApi.create);
    const [name, setName] = useState('');
    const [host, setHost] = useState('');
    const [platform, setPlatform] = useState<Platform>('web');
    const ready = name.trim().length > 0 && cleanHost(host).length > 2;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if(!ready) return;
        const project = await create.run({
            name: name.trim(),
            host: cleanHost(host),
            platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }).catch(() => null);
        if(project === null) return;
        replace(project);
        reload();
        setName('');
        setHost('');
        setAdding(false);
        navigate(`/${project.id}`);
    };

    return (
        <Modal isOpen={adding} onOpenChange={setAdding} title={copy.addApp.title} width='md'>
            <Form className='flex flex-col gap-6' onSubmit={submit}>
                <div className='flex flex-col gap-2'>
                    <span className='text-[0.75rem] text-label-2'>{copy.addApp.source}</span>
                    <Segmented label={copy.addApp.platform} choices={[...PLATFORMS]} value={platform} onChange={setPlatform} />
                </div>
                <TextInput id='app-name' labelText={copy.addApp.name} placeholder='Tienda Andes' value={name} onChange={(event) => setName(event.target.value)} autoFocus />
                <TextInput
                    id='app-host'
                    labelText={platform === 'web' ? copy.addApp.domain : copy.addApp.serviceHost}
                    helperText={platform === 'web' ? copy.addApp.domainHelper : copy.addApp.serviceHelper}
                    placeholder={platform === 'web' ? 'tiendaandes.cl' : 'api.tiendaandes.cl'}
                    value={host}
                    onChange={(event) => setHost(event.target.value)}
                />
                {create.error ? <InlineNotification kind='error' lowContrast hideCloseButton title={createError(create.error) ?? ''} /> : null}
                <ButtonSet className='justify-end'>
                    <Button kind='secondary' onClick={() => setAdding(false)}>
                        {copy.cancel}
                    </Button>
                    <Button kind='primary' type='submit' disabled={!ready || create.loading}>
                        {copy.addApp.create}
                    </Button>
                </ButtonSet>
            </Form>
        </Modal>
    );
};

export default AddApp;
