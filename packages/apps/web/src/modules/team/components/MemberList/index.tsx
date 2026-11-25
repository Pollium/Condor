import { IconButton, InlineLoading } from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';
import { Role } from '@condor/contracts/auth/domain';
import { Member } from '@condor/contracts/members/domain';
import { memberRoutes } from '@condor/contracts/members/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import RemoveMember from '@/modules/team/components/RemoveMember';
import { copy } from '@/modules/team/i18n';
import { ROLE_HINT, ROLE_LABEL } from '@/modules/team/utils/roles';
import { teamError } from '@/modules/team/utils/team-error';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { fmt } from '@/shared/utils/format';
import { useState } from 'react';

const ROLES: Role[] = ['owner', 'admin', 'viewer'];

interface MemberListProps{
    members: Member[];
    selfId: string | undefined;
    manage: boolean;
}

const MemberList = ({ members, selfId, manage }: MemberListProps) => {
    const update = useMutation(memberRoutes.update);
    const [removing, setRemoving] = useState<Member | null>(null);
    const [pending, setPending] = useState<string | null>(null);

    const changeRole = (member: Member, role: Role) => {
        if(role === member.role) return;
        setPending(member.id);
        void update.run({ path: { userId: member.id }, body: { role } }).catch(() => null).finally(() => setPending(null));
    };

    return (
        <div className='flex flex-col'>
            <ul className='flex flex-col'>
                {members.map((member) => {
                    const self = member.id === selfId;
                    const editable = manage && !self;
                    return (
                        <li key={member.id} className='flex min-h-14 items-center justify-between gap-4 border-b border-separator py-2'>
                            <div className='min-w-0'>
                                <p className='truncate text-[0.875rem] text-foreground'>
                                    {member.name}
                                    {self ? <span className='text-label-2'> · {copy.memberList.you}</span> : null}
                                </p>
                                <p className='truncate text-[0.8125rem] text-label-2'>
                                    {member.email} · {member.lastSignInAt === null ? copy.memberList.neverSignedIn : copy.memberList.signedIn(fmt.ago(member.lastSignInAt))}
                                </p>
                            </div>
                            <div className='flex shrink-0 items-center gap-1'>
                                {pending === member.id ? <InlineLoading description={copy.memberList.saving} className='w-auto' /> : null}
                                {editable ? (
                                    <ToolbarMenu
                                        label={copy.memberList.roleOf(member.name)}
                                        choices={ROLES.map((role) => ({ value: role, label: ROLE_LABEL[role] }))}
                                        value={member.role}
                                        onChange={(role) => changeRole(member, role)}
                                    />
                                ) : (
                                    <span title={ROLE_HINT[member.role]} className='px-4 text-[0.875rem] text-label-2'>{ROLE_LABEL[member.role]}</span>
                                )}
                                {editable ? (
                                    <IconButton kind='ghost' size='sm' label={copy.memberList.remove(member.name)} align='left' onClick={() => setRemoving(member)}>
                                        <TrashCan />
                                    </IconButton>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ul>
            {update.error ? <p className='pt-2 text-[0.75rem] text-danger'>{teamError(update.error)}</p> : null}
            <RemoveMember member={removing} onClose={() => setRemoving(null)} />
        </div>
    );
};

export default MemberList;
