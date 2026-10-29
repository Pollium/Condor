import { Button, Modal, TextInput } from '@carbon/react';
import Portal from '@/shared/components/Portal';
import { Group, Row } from '@/modules/projects/components/SettingsRows';
import { projectsApi } from '@/modules/projects/api/api';
import { useProject, useWorkspace } from '@/modules/projects/hooks/use-workspace';
import { errorCopy } from '@/shared/utils/error-copy';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DangerZone = ({ disabled }: { disabled: boolean }) => {
    const project = useProject();
    const { reload } = useWorkspace();
    const navigate = useNavigate();
    const remove = useMutation(projectsApi.remove);
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState('');
    const matches = typed.trim() === project.name;

    const close = () => {
        setOpen(false);
        setTyped('');
    };

    const submit = async () => {
        if(!matches) return;
        try{
            await remove.run(project.id);
        }catch{
            return;
        }
        reload();
        navigate('/');
    };

    return (
        <Group title='Zona de peligro' note='Eliminar la app borra sus eventos, sesiones y grabaciones. No se puede deshacer.'>
            <Row label='Eliminar la app' detail={`${project.name} · ${project.host}`}>
                <Button kind='danger--ghost' size='sm' disabled={disabled} onClick={() => setOpen(true)} className='-mr-4'>
                    Eliminar
                </Button>
            </Row>
            <Portal>
                <Modal
                    open={open}
                    danger
                    size='sm'
                    modalHeading={`¿Eliminar ${project.name}?`}
                    primaryButtonText='Eliminar la app'
                    secondaryButtonText='Cancelar'
                    closeButtonLabel='Cerrar'
                    primaryButtonDisabled={!matches}
                    loadingStatus={remove.loading ? 'active' : 'inactive'}
                    loadingDescription='Eliminando…'
                    onRequestSubmit={submit}
                    onRequestClose={close}
                >
                    <div className='flex flex-col gap-4 text-[0.875rem]'>
                        <p>Se borran para siempre todos los datos de {project.host}. El fragmento instalado deja de enviar eventos.</p>
                        <TextInput
                            id='delete-confirm'
                            labelText={`Escribe ${project.name} para confirmar`}
                            value={typed}
                            onChange={(event) => setTyped(event.target.value)}
                            autoComplete='off'
                            data-modal-primary-focus
                        />
                        {remove.error ? <p className='text-danger'>{errorCopy()(remove.error)}</p> : null}
                    </div>
                </Modal>
            </Portal>
        </Group>
    );
};

export default DangerZone;
