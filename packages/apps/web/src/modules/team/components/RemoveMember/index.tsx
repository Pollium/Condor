import { Modal } from '@carbon/react';
import Portal from '@/shared/components/Portal';
import { Member } from '@condor/contracts/members/domain';
import { memberRoutes } from '@condor/contracts/members/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { copy } from '@/modules/team/i18n';
import { teamError } from '@/modules/team/utils/team-error';
import { copy as shared } from '@/shared/i18n';

interface RemoveMemberProps{
    member: Member | null;
    onClose: () => void;
}

const RemoveMember = ({ member, onClose }: RemoveMemberProps) => {
    const remove = useMutation(memberRoutes.remove);

    const submit = async () => {
        if(member === null) return;
        try{
            await remove.run({ path: { userId: member.id } });
        }catch{
            return;
        }
        onClose();
    };

    return (
        <Portal>
            <Modal
                open={member !== null}
                danger
                size='xs'
                modalHeading={copy.removeMember.heading(member?.name ?? '')}
                primaryButtonText={copy.removeMember.confirm}
                secondaryButtonText={copy.removeMember.cancel}
                closeButtonLabel={shared.close}
                loadingStatus={remove.loading ? 'active' : 'inactive'}
                loadingDescription={copy.removeMember.removing}
                onRequestSubmit={submit}
                onRequestClose={onClose}
            >
                <div className='flex flex-col gap-3 text-[0.875rem]'>
                    <p>{copy.removeMember.body(member?.email ?? '')}</p>
                    {remove.error ? <p className='text-danger'>{teamError(remove.error)}</p> : null}
                </div>
            </Modal>
        </Portal>
    );
};

export default RemoveMember;
