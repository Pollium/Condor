import { Button, Form, InlineLoading, InlineNotification, PasswordInput, Stack, TextInput } from '@carbon/react';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import AuthFrame from '@/modules/auth/components/AuthFrame';
import { authApi } from '@/modules/auth/api/api';
import { copy } from '@/modules/auth/i18n';
import { startSession } from '@/modules/auth/utils/start-session';
import { errorCopy, fieldErrors } from '@/shared/utils/error-copy';
import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const setupError = errorCopy({ 'Auth::SetupClosed': copy.errors.setupClosed });

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
        <AuthFrame title={copy.setup.title} lead={copy.setup.lead}>
            <Form onSubmit={submit}>
                <Stack gap={6}>
                    <TextInput id='name' labelText={copy.fields.name} autoComplete='name' value={name} onChange={(event) => setName(event.target.value)} invalid={invalid.name !== undefined} invalidText={copy.fields.nameMissing} required />
                    <TextInput id='email' type='email' labelText={copy.fields.email} autoComplete='email' value={email} onChange={(event) => setEmail(event.target.value)} invalid={invalid.email !== undefined} invalidText={copy.fields.emailInvalid} required />
                    <PasswordInput
                        id='password'
                        labelText={copy.fields.password}
                        helperText={copy.fields.passwordHelper}
                        showPasswordLabel={copy.fields.showPassword}
                        hidePasswordLabel={copy.fields.hidePassword}
                        autoComplete='new-password'
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        invalid={invalid.password !== undefined}
                        invalidText={copy.fields.passwordShort}
                        required
                    />
                    {setup.error && Object.keys(invalid).length === 0 ? <InlineNotification kind='error' lowContrast hideCloseButton title={setupError(setup.error) ?? ''} /> : null}
                    <Button type='submit' disabled={setup.loading || password.length < 8}>
                        {setup.loading ? <InlineLoading description={copy.setup.submitting} /> : copy.setup.submit}
                    </Button>
                </Stack>
            </Form>
        </AuthFrame>
    );
};

export default SetupPage;
