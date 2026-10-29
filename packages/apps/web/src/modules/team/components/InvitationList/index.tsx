import { Button } from '@carbon/react';
import { Invitation } from '@condor/contracts/members/domain';
import { teamApi } from '@/modules/team/api/api';
import { ROLE_LABEL } from '@/modules/team/utils/roles';
import { teamError } from '@/modules/team/utils/team-error';
import { fmt } from '@/shared/utils/format';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';

interface InvitationListProps{
    invitations: Invitation[];
    onChanged: () => void;
}

const expiry = (iso: string): string => new Date(iso).getTime() < Date.now() ? `venció el ${fmt.day(iso)}` : `vence el ${fmt.day(iso)}`;

const InvitationList = ({ invitations, onChanged }: InvitationListProps) => {
    const revoke = useMutation(teamApi.revoke);

    return (
        <div className='flex flex-col'>
            <ul className='flex flex-col'>
                {invitations.map((invitation) => (
                    <li key={invitation.id} className='flex min-h-14 items-center justify-between gap-4 border-b border-separator py-2'>
                        <div className='min-w-0'>
                            <p className='truncate text-[0.875rem] text-foreground'>{invitation.email}</p>
                            <p className='truncate text-[0.8125rem] text-label-2'>
                                {ROLE_LABEL[invitation.role]} · {expiry(invitation.expiresAt)}
                            </p>
                        </div>
                        <Button kind='ghost' size='sm' disabled={revoke.loading} onClick={() => void revoke.run(invitation.id).then(onChanged, () => null)} className='-mr-4 shrink-0'>
                            Revocar
                        </Button>
                    </li>
                ))}
            </ul>
            {revoke.error ? <p className='pt-2 text-[0.75rem] text-danger'>{teamError(revoke.error)}</p> : null}
        </div>
    );
};

export default InvitationList;
