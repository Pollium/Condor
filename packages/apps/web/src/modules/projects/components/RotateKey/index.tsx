import { Modal } from '@carbon/react';
import Portal from '@/shared/components/Portal';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';

interface RotateKeyProps{
    open: boolean;
    onClose: () => void;
}

const RotateKey = ({ open, onClose }: RotateKeyProps) => {
    const project = useProject();
    const { status, error, rotate } = useSaveProject();

    const submit = async () => {
        if(await rotate()) onClose();
    };

    return (
        <Portal>
            <Modal
                open={open}
                danger
                size='sm'
                modalHeading='¿Rotar la clave pública?'
                primaryButtonText='Rotar la clave'
                secondaryButtonText='Cancelar'
                closeButtonLabel='Cerrar'
                loadingStatus={status === 'saving' ? 'active' : 'inactive'}
                loadingDescription='Rotando…'
                onRequestSubmit={submit}
                onRequestClose={onClose}
            >
                <div className='flex flex-col gap-3 text-[0.875rem]'>
                    <p>
                        {project.name} recibirá una clave nueva. La actual, <span className='font-mono'>{project.publicKey}</span>, deja de funcionar en cuanto confirmes:
                        los eventos y grabaciones que la usen se rechazan.
                    </p>
                    <p className='text-label-2'>Actualiza el fragmento en tu sitio o tu backend justo después.</p>
                    {error ? <p className='text-danger'>{error}</p> : null}
                </div>
            </Modal>
        </Portal>
    );
};

export default RotateKey;
