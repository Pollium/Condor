import { Modal } from '@carbon/react';
import Portal from '@/shared/components/Portal';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { copy as shared } from '@/shared/i18n';

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
                modalHeading={copy.rotateKey.heading}
                primaryButtonText={copy.rotateKey.confirm}
                secondaryButtonText={copy.cancel}
                closeButtonLabel={shared.close}
                loadingStatus={status === 'saving' ? 'active' : 'inactive'}
                loadingDescription={copy.rotateKey.rotating}
                onRequestSubmit={submit}
                onRequestClose={onClose}
            >
                <div className='flex flex-col gap-3 text-[0.875rem]'>
                    <p>
                        {copy.rotateKey.lead(project.name)}<span className='font-mono'>{project.publicKey}</span>{copy.rotateKey.tail}
                    </p>
                    <p className='text-label-2'>{copy.rotateKey.update}</p>
                    {error ? <p className='text-danger'>{error}</p> : null}
                </div>
            </Modal>
        </Portal>
    );
};

export default RotateKey;
