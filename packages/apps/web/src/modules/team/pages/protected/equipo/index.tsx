import { InlineLoading } from '@carbon/react';
import { InvitedRole } from '@condor/contracts/members/domain';
import { useMe } from '@/modules/auth/hooks/use-me';
import InvitationList from '@/modules/team/components/InvitationList';
import InviteForm from '@/modules/team/components/InviteForm';
import MemberList from '@/modules/team/components/MemberList';
import { teamApi } from '@/modules/team/api/api';
import { teamError } from '@/modules/team/utils/team-error';
import { PageHeader, Section } from '@/shared/components/Page';
import { useQuery } from '@condor/ui/hooks/api/use-query';

const INVITABLE: Record<string, InvitedRole[]> = {
    owner: ['admin', 'viewer'],
    admin: ['viewer']
};

const TeamPage = () => {
    const me = useMe();
    const role = me.data?.role;
    const invitable = role === undefined ? [] : INVITABLE[role] ?? [];
    const members = useQuery(teamApi.members, []);
    const invitations = useQuery(teamApi.invitations, [], { enabled: invitable.length > 0 });
    const pending = invitations.data ?? [];
    const count = members.data?.length;

    return (
        <div className='mx-auto flex w-full max-w-2xl flex-col gap-10 pb-16 pt-2'>
            <PageHeader title='Equipo' hint={count === undefined ? undefined : `${count} ${count === 1 ? 'persona' : 'personas'}`} />
            <Section title='Personas'>
                {members.data === null ? (
                    members.error ? <p className='text-[0.875rem] text-danger'>{teamError(members.error)}</p> : <InlineLoading description='Cargando el equipo…' />
                ) : (
                    <MemberList members={members.data} selfId={me.data?.id} manage={role === 'owner'} onChanged={members.reload} />
                )}
                {role === 'owner' ? null : <p className='text-[0.75rem] text-label-2'>Solo un dueño puede cambiar roles o quitar a alguien.</p>}
            </Section>
            {invitable.length ? (
                <Section title='Invitar'>
                    <InviteForm key={invitable.join()} roles={invitable} onInvited={invitations.reload} />
                    {role === 'admin' ? <p className='-mt-2 text-[0.75rem] text-label-2'>Como admin solo puedes invitar lectores.</p> : null}
                </Section>
            ) : null}
            {pending.length ? (
                <Section title='Invitaciones pendientes'>
                    <InvitationList invitations={pending} onChanged={invitations.reload} />
                </Section>
            ) : null}
        </div>
    );
};

export default TeamPage;
