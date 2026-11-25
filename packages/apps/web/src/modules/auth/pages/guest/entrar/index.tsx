import { Button, Form, InlineLoading, InlineNotification, PasswordInput, Stack, TextInput } from '@carbon/react';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { session } from '@pollium/readable-react/session/session';
import AuthFrame from '@/modules/auth/components/AuthFrame';
import { authApi } from '@/modules/auth/api/api';
import { copy } from '@/modules/auth/i18n';
import { errorCopy } from '@/shared/utils/error-copy';
import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

const signInError = errorCopy({ 'Auth::InvalidCredentials': copy.errors.invalidCredentials });

const SignInPage = () => {
    const setup = useQuery(authApi.setupStatus, []);
    const signIn = useMutation(authApi.signIn);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if(setup.data?.needsOwner) return <Navigate to='/configurar' replace />;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const started = await signIn.run({ email, password }).catch(() => null);
        if(started !== null) session.start(started.token);
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
