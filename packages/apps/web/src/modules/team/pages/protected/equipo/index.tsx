import { InlineLoading } from '@carbon/react';
import { InvitedRole } from '@condor/contracts/members/domain';
import { useMe } from '@/modules/auth/hooks/use-me';
import InvitationList from '@/modules/team/components/InvitationList';
import InviteForm from '@/modules/team/components/InviteForm';
import MemberList from '@/modules/team/components/MemberList';
import { teamApi } from '@/modules/team/api/api';
import { copy } from '@/modules/team/i18n';
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
            <PageHeader title={copy.page.title} hint={count === undefined ? undefined : copy.page.people(count)} />
            <Section title={copy.page.members}>
                {members.data === null ? (
                    members.error ? <p className='text-[0.875rem] text-danger'>{teamError(members.error)}</p> : <InlineLoading description={copy.page.loading} />
                ) : (
                    <MemberList members={members.data} selfId={me.data?.id} manage={role === 'owner'} onChanged={members.reload} />
                )}
                {role === 'owner' ? null : <p className='text-[0.75rem] text-label-2'>{copy.page.ownerOnly}</p>}
            </Section>
            {invitable.length ? (
                <Section title={copy.page.invite}>
                    <InviteForm key={invitable.join()} roles={invitable} onInvited={invitations.reload} />
                    {role === 'admin' ? <p className='-mt-2 text-[0.75rem] text-label-2'>{copy.page.adminInvites}</p> : null}
                </Section>
            ) : null}
            {pending.length ? (
                <Section title={copy.page.pending}>
                    <InvitationList invitations={pending} onChanged={invitations.reload} />
                </Section>
            ) : null}
        </div>
    );
};

export default TeamPage;
