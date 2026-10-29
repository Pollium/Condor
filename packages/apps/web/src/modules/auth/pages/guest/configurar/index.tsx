import { Button, Form, InlineLoading, InlineNotification, PasswordInput, Stack, TextInput } from '@carbon/react';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import AuthFrame from '@/modules/auth/components/AuthFrame';
import { authApi } from '@/modules/auth/api/api';
import { startSession } from '@/modules/auth/utils/start-session';
import { errorCopy, fieldErrors } from '@/shared/utils/error-copy';
import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const copy = errorCopy({ 'Auth::SetupClosed': 'Esta instalación ya tiene dueño. Entra con tu cuenta.' });

const SetupPage = () => {
    const navigate = useNavigate();
    const status = useQuery(authApi.setupStatus, []);
    const setup = useMutation(authApi.setup);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const invalid = fieldErrors(setup.error);

    if(status.data?.needsOwner === false) return <Navigate to='/entrar' replace />;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const session = await setup.run({ name, email, password }).catch(() => null);
        if(session === null) return;
        await startSession(session);
        navigate('/', { replace: true });
    };

    return (
        <AuthFrame title='Configura Condor' lead='Crea la cuenta del dueño de esta instalación. Después podrás invitar a tu equipo.'>
            <Form onSubmit={submit}>
                <Stack gap={6}>
                    <TextInput id='name' labelText='Tu nombre' autoComplete='name' value={name} onChange={(event) => setName(event.target.value)} invalid={invalid.name !== undefined} invalidText='Escribe tu nombre' required />
                    <TextInput id='email' type='email' labelText='Correo' autoComplete='email' value={email} onChange={(event) => setEmail(event.target.value)} invalid={invalid.email !== undefined} invalidText='Escribe un correo válido' required />
                    <PasswordInput id='password' labelText='Contraseña' helperText='Al menos 8 caracteres' autoComplete='new-password' value={password} onChange={(event) => setPassword(event.target.value)} invalid={invalid.password !== undefined} invalidText='Usa al menos 8 caracteres' required />
                    {setup.error && Object.keys(invalid).length === 0 ? <InlineNotification kind='error' lowContrast hideCloseButton title={copy(setup.error) ?? ''} /> : null}
                    <Button type='submit' disabled={setup.loading || password.length < 8}>
                        {setup.loading ? <InlineLoading description='Creando…' /> : 'Crear la cuenta'}
                    </Button>
                </Stack>
            </Form>
        </AuthFrame>
    );
};

export default SetupPage;
