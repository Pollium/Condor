import { Button, CodeSnippet, InlineNotification, TextInput } from '@carbon/react';
import { CreatedInvitation, InvitedRole } from '@condor/contracts/members/domain';
import { teamApi } from '@/modules/team/api/api';
import { ROLE_HINT, ROLE_LABEL } from '@/modules/team/utils/roles';
import { teamError } from '@/modules/team/utils/team-error';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { fmt } from '@/shared/utils/format';
import { fieldErrors } from '@/shared/utils/error-copy';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { useState, type FormEvent } from 'react';

interface InviteFormProps{
    roles: InvitedRole[];
    onInvited: () => void;
}

const InviteForm = ({ roles, onInvited }: InviteFormProps) => {
    const invite = useMutation(teamApi.invite);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<InvitedRole>(roles[roles.length - 1]);
    const [created, setCreated] = useState<CreatedInvitation | null>(null);
    const fields = fieldErrors(invite.error);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const result = await invite.run({ email: email.trim(), role }).catch(() => null);
        if(result === null) return;
        setCreated(result);
        setEmail('');
        onInvited();
    };

    return (
        <div className='flex flex-col gap-4'>
            <form onSubmit={submit} className='flex flex-wrap items-end gap-x-3 gap-y-2'>
                <TextInput
                    id='invite-email'
                    type='email'
                    size='md'
                    labelText='Correo'
                    placeholder='persona@empresa.cl'
                    value={email}
                    invalid={fields.email !== undefined}
                    invalidText='Revisa el correo'
                    onChange={(event) => setEmail(event.target.value)}
                    className='min-w-[14rem] flex-1'
                />
                {roles.length > 1 ? (
                    <ToolbarMenu label='Rol' choices={roles.map((entry) => ({ value: entry, label: ROLE_LABEL[entry] }))} value={role} onChange={setRole} />
                ) : (
                    <span className='flex h-10 items-center px-2 text-[0.875rem] text-label-2'>{ROLE_LABEL[role]}</span>
                )}
                <Button type='submit' kind='primary' size='md' disabled={email.trim() === '' || invite.loading}>
                    {invite.loading ? 'Invitando…' : 'Invitar'}
                </Button>
            </form>
            <p className='text-[0.75rem] text-label-2'>{ROLE_LABEL[role]}: {ROLE_HINT[role].toLowerCase()}.</p>
            {invite.error && fields.email === undefined ? <p className='text-[0.75rem] text-danger'>{teamError(invite.error)}</p> : null}
            {created ? (
                <div className='flex flex-col'>
                    <InlineNotification
                        kind='success'
                        lowContrast
                        title='Invitación creada'
                        subtitle={`Envía este enlace a ${created.invitation.email}. Solo se muestra ahora y vence el ${fmt.day(created.invitation.expiresAt)}.`}
                        statusIconDescription='Listo'
                        onCloseButtonClick={() => setCreated(null)}
                        className='max-w-none'
                    />
                    <CodeSnippet type='single' feedback='Copiado' copyButtonDescription='Copiar el enlace' className='max-w-none'>
                        {`${window.location.origin}/invitacion/${created.token}`}
                    </CodeSnippet>
                </div>
            ) : null}
        </div>
    );
};

export default InviteForm;
