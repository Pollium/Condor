import { Button, Form, InlineLoading, InlineNotification, PasswordInput, SkeletonText, Stack, TextInput } from '@carbon/react';
import { memberRoutes } from '@condor/contracts/members/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { session } from '@pollium/readable-react/session/session';
import AuthFrame from '@/modules/auth/components/AuthFrame';
import { copy } from '@/modules/auth/i18n';
import { invitationError } from '@/modules/auth/utils/auth-error';
import { ROLE_LABEL } from '@/modules/team/utils/roles';
import { FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AcceptInvitationPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const preview = useQuery(memberRoutes.preview, { path: { token } });
    const accept = useMutation(memberRoutes.accept);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if(token === undefined) return;
        const started = await accept.run({ body: { token, name, password } }).catch(() => null);
        if(started !== null) session.start(started.token);
    };

    if(preview.error){
        return (
            <AuthFrame title={copy.invitation.invalid} lead={invitationError(preview.error) ?? ''}>
                <Button kind='tertiary' onClick={() => navigate('/entrar')}>{copy.invitation.goToSignIn}</Button>
            </AuthFrame>
        );
    }

    const invitation = preview.data;
    return (
        <AuthFrame
            title={copy.invitation.title}
            lead={invitation ? copy.invitation.lead(invitation.invitedBy, ROLE_LABEL[invitation.role].toLowerCase()) : copy.invitation.loading}
        >
            {invitation === null ? <SkeletonText paragraph lineCount={3} /> : (
                <Form onSubmit={submit}>
                    <Stack gap={6}>
                        <TextInput id='email' labelText={copy.fields.email} value={invitation.email} readOnly />
                        <TextInput id='name' labelText={copy.fields.name} autoComplete='name' value={name} onChange={(event) => setName(event.target.value)} required />
                        <PasswordInput
                            id='password'
                            labelText={copy.fields.password}
                            helperText={copy.fields.passwordHelper}
                            showPasswordLabel={copy.fields.showPassword}
                            hidePasswordLabel={copy.fields.hidePassword}
                            autoComplete='new-password'
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                        {accept.error ? <InlineNotification kind='error' lowContrast hideCloseButton title={invitationError(accept.error) ?? ''} /> : null}
                        <Button type='submit' disabled={accept.loading || name === '' || password.length < 8}>
                            {accept.loading ? <InlineLoading description={copy.invitation.submitting} /> : copy.invitation.submit}
                        </Button>
                    </Stack>
                </Form>
            )}
        </AuthFrame>
    );
};

export default AcceptInvitationPage;
