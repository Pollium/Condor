import { InlineNotification, Modal } from '@carbon/react';
import { Funnel } from '@condor/contracts/funnels/domain';
import { funnelRoutes } from '@condor/contracts/funnels/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { createPortal } from 'react-dom';
import { copy } from '@/modules/funnels/i18n';
import { funnelError } from '@/modules/funnels/utils/funnel-error';
import { copy as shared } from '@/shared/i18n';

interface FunnelDeleteProps{
    projectId: string;
    funnel: Funnel;
    onClose: () => void;
    onDeleted: () => void;
}

const FunnelDelete = ({ projectId, funnel, onClose, onDeleted }: FunnelDeleteProps) => {
    const remove = useMutation(funnelRoutes.remove, { path: { projectId, funnelId: funnel.id } });
    const error = funnelError(remove.error);

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
            onRequestSubmit={() => remove.run().then(onDeleted, () => undefined)}
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
