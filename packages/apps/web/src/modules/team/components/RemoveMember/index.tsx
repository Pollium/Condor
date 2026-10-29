import { Modal } from '@carbon/react';
import Portal from '@/shared/components/Portal';
import { Member } from '@condor/contracts/members/domain';
import { teamApi } from '@/modules/team/api/api';
import { teamError } from '@/modules/team/utils/team-error';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';

interface RemoveMemberProps{
    member: Member | null;
    onClose: () => void;
    onRemoved: () => void;
}

const RemoveMember = ({ member, onClose, onRemoved }: RemoveMemberProps) => {
    const remove = useMutation(teamApi.remove);

    const submit = async () => {
        if(member === null) return;
        try{
            await remove.run(member.id);
        }catch{
            return;
        }
        onRemoved();
        onClose();
    };

    return (
        <Portal>
            <Modal
                open={member !== null}
                danger
                size='xs'
                modalHeading={`¿Quitar a ${member?.name ?? ''}?`}
                primaryButtonText='Quitar del equipo'
                secondaryButtonText='Cancelar'
                closeButtonLabel='Cerrar'
                loadingStatus={remove.loading ? 'active' : 'inactive'}
                loadingDescription='Quitando…'
                onRequestSubmit={submit}
                onRequestClose={onClose}
            >
                <div className='flex flex-col gap-3 text-[0.875rem]'>
                    <p>{member?.email} pierde el acceso a Condor en ese momento. Para volver necesitará otra invitación.</p>
                    {remove.error ? <p className='text-danger'>{teamError(remove.error)}</p> : null}
                </div>
            </Modal>
        </Portal>
    );
};

export default RemoveMember;
