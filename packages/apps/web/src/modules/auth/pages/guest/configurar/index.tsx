import { Button, Form, InlineLoading, InlineNotification, PasswordInput, Stack, TextInput } from '@carbon/react';
import { authRoutes } from '@condor/contracts/auth/routes';
import { ApiError } from '@pollium/readable-react/http/ApiError';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { session } from '@pollium/readable-react/session/session';
import AuthFrame from '@/modules/auth/components/AuthFrame';
import { copy } from '@/modules/auth/i18n';
import { authError } from '@/modules/auth/utils/auth-error';
import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

const SetupPage = () => {
    const status = useQuery(authRoutes.setupStatus);
    const setup = useMutation(authRoutes.setup);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const invalid = setup.error instanceof ApiError ? setup.error.fields : {};

    if(status.data?.needsOwner === false) return <Navigate to='/entrar' replace />;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const started = await setup.run({ body: { name, email, password } }).catch(() => null);
        if(started !== null) session.start(started.token);
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
                    {setup.error && Object.keys(invalid).length === 0 ? <InlineNotification kind='error' lowContrast hideCloseButton title={authError(setup.error) ?? ''} /> : null}
                    <Button type='submit' disabled={setup.loading || password.length < 8}>
                        {setup.loading ? <InlineLoading description={copy.setup.submitting} /> : copy.setup.submit}
                    </Button>
                </Stack>
            </Form>
        </AuthFrame>
    );
};

export default SetupPage;
