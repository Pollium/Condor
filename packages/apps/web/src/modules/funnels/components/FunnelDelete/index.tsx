import { InlineNotification, Modal } from '@carbon/react';
import { Funnel } from '@condor/contracts/funnels/domain';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { createPortal } from 'react-dom';
import { funnelsApi } from '@/modules/funnels/api/api';
import { copy } from '@/modules/funnels/i18n';
import { copy as shared } from '@/shared/i18n';
import { errorCopy } from '@/shared/utils/error-copy';

interface FunnelDeleteProps{
    projectId: string;
    funnel: Funnel;
    onClose: () => void;
    onDeleted: () => void;
}

const FunnelDelete = ({ projectId, funnel, onClose, onDeleted }: FunnelDeleteProps) => {
    const remove = useMutation(funnelsApi.remove);
    const error = errorCopy({ 'Funnel::NotFound': copy.errors.notFound })(remove.error);

    return createPortal(
        <Modal
            open
            danger
            size='xs'
            modalHeading={copy.deleteDialog.heading(funnel.name)}
            primaryButtonText={remove.loading ? copy.deleteDialog.deleting : copy.deleteDialog.confirm}
            secondaryButtonText={copy.deleteDialog.cancel}
            primaryButtonDisabled={remove.loading}
            closeButtonLabel={shared.close}
            onRequestClose={onClose}
            onRequestSubmit={() => remove.run(projectId, funnel.id).then(onDeleted, () => undefined)}
        >
            <div className='flex flex-col gap-4'>
                <p className='text-[0.875rem] text-label-2'>{copy.deleteDialog.body}</p>
                {error ? <InlineNotification kind='error' lowContrast hideCloseButton title={error} /> : null}
            </div>
        </Modal>,
        document.body
    );
};

export default FunnelDelete;
