import { Button, Form, InlineLoading, InlineNotification, PasswordInput, Stack, TextInput } from '@carbon/react';
import { authRoutes } from '@condor/contracts/auth/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { session } from '@pollium/readable-react/session/session';
import AuthFrame from '@/modules/auth/components/AuthFrame';
import { copy } from '@/modules/auth/i18n';
import { authError } from '@/modules/auth/utils/auth-error';
import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

const SignInPage = () => {
    const setup = useQuery(authRoutes.setupStatus);
    const signIn = useMutation(authRoutes.signIn);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if(setup.data?.needsOwner) return <Navigate to='/configurar' replace />;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const started = await signIn.run({ body: { email, password } }).catch(() => null);
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
                    {signIn.error ? <InlineNotification kind='error' lowContrast hideCloseButton title={authError(signIn.error) ?? ''} /> : null}
                    <Button type='submit' disabled={signIn.loading || email === '' || password === ''}>
                        {signIn.loading ? <InlineLoading description={copy.signIn.submitting} /> : copy.signIn.submit}
                    </Button>
                </Stack>
            </Form>
        </AuthFrame>
    );
};

export default SignInPage;
