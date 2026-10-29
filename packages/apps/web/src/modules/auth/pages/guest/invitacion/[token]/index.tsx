import { Button, Form, InlineLoading, InlineNotification, PasswordInput, SkeletonText, Stack, TextInput } from '@carbon/react';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import AuthFrame from '@/modules/auth/components/AuthFrame';
import { authApi } from '@/modules/auth/api/api';
import { startSession } from '@/modules/auth/utils/start-session';
import { ROLE_LABEL } from '@/modules/team/utils/roles';
import { errorCopy } from '@/shared/utils/error-copy';
import { FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const copy = errorCopy({
    'Invitation::NotFound': 'Esta invitación no existe o ya se usó.',
    'Invitation::Expired': 'Esta invitación venció. Pide una nueva.',
    'Invitation::AlreadyMember': 'Este correo ya tiene una cuenta. Entra con ella.'
});

const AcceptInvitationPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const preview = useQuery(authApi.previewInvitation, [token]);
    const accept = useMutation(authApi.acceptInvitation);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if(token === undefined) return;
        const session = await accept.run({ token, name, password }).catch(() => null);
        if(session === null) return;
        await startSession(session);
        navigate('/', { replace: true });
    };

    if(preview.error){
        return (
            <AuthFrame title='Invitación no válida' lead={copy(preview.error) ?? ''}>
                <Button kind='tertiary' onClick={() => navigate('/entrar')}>Ir a entrar</Button>
            </AuthFrame>
        );
    }

    const invitation = preview.data;
    return (
        <AuthFrame
            title='Únete a Condor'
            lead={invitation ? `${invitation.invitedBy} te invitó como ${ROLE_LABEL[invitation.role].toLowerCase()}.` : 'Cargando la invitación…'}
        >
            {invitation === null ? <SkeletonText paragraph lineCount={3} /> : (
                <Form onSubmit={submit}>
                    <Stack gap={6}>
                        <TextInput id='email' labelText='Correo' value={invitation.email} readOnly />
                        <TextInput id='name' labelText='Tu nombre' autoComplete='name' value={name} onChange={(event) => setName(event.target.value)} required />
                        <PasswordInput id='password' labelText='Contraseña' helperText='Al menos 8 caracteres' autoComplete='new-password' value={password} onChange={(event) => setPassword(event.target.value)} required />
                        {accept.error ? <InlineNotification kind='error' lowContrast hideCloseButton title={copy(accept.error) ?? ''} /> : null}
                        <Button type='submit' disabled={accept.loading || name === '' || password.length < 8}>
                            {accept.loading ? <InlineLoading description='Creando tu cuenta…' /> : 'Crear mi cuenta'}
                        </Button>
                    </Stack>
                </Form>
            )}
        </AuthFrame>
    );
};

export default AcceptInvitationPage;
