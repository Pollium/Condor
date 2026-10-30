import { Button, Form, InlineLoading, InlineNotification, PasswordInput, Stack, TextInput } from '@carbon/react';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import AuthFrame from '@/modules/auth/components/AuthFrame';
import { authApi } from '@/modules/auth/api/api';
import { copy } from '@/modules/auth/i18n';
import { startSession } from '@/modules/auth/utils/start-session';
import { errorCopy } from '@/shared/utils/error-copy';
import { FormEvent, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

const signInError = errorCopy({ 'Auth::InvalidCredentials': copy.errors.invalidCredentials });

const SignInPage = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const setup = useQuery(authApi.setupStatus, []);
    const signIn = useMutation(authApi.signIn);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if(setup.data?.needsOwner) return <Navigate to='/configurar' replace />;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const session = await signIn.run({ email, password }).catch(() => null);
        if(session === null) return;
        await startSession(session);
        navigate(params.get('next') ?? '/', { replace: true });
    };

    return (
        <AuthFrame title={copy.signIn.title} lead={copy.signIn.lead}>
            <Form onSubmit={submit}>
                <Stack gap={6}>
                    <TextInput id='email' type='email' labelText={copy.fields.email} autoComplete='email' value={email} onChange={(event) => setEmail(event.target.value)} required />
                    <PasswordInput
                        id='password'
                        labelText={copy.fields.password}
                        showPasswordLabel={copy.fields.showPassword}
                        hidePasswordLabel={copy.fields.hidePassword}
                        autoComplete='current-password'
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                    {signIn.error ? <InlineNotification kind='error' lowContrast hideCloseButton title={signInError(signIn.error) ?? ''} /> : null}
                    <Button type='submit' disabled={signIn.loading || email === '' || password === ''}>
                        {signIn.loading ? <InlineLoading description={copy.signIn.submitting} /> : copy.signIn.submit}
                    </Button>
                </Stack>
            </Form>
        </AuthFrame>
    );
};

export default SignInPage;
