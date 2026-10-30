import { Button, InlineLoading, PasswordInput } from '@carbon/react';
import { copy } from '@/modules/account/i18n';
import { accountError } from '@/modules/account/utils/account-error';
import { authApi } from '@/modules/auth/api/api';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { useState, type FormEvent } from 'react';

const PasswordForm = () => {
    const change = useMutation(authApi.changePassword);
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [done, setDone] = useState(false);
    const short = next !== '' && next.length < 8;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setDone(false);
        if(await change.run({ current, next }).then(() => true, () => false)){
            setCurrent('');
            setNext('');
            setDone(true);
        }
    };

    return (
        <form onSubmit={submit} className='flex flex-col gap-4'>
            <div className='grid gap-x-6 gap-y-4 sm:grid-cols-2'>
                <PasswordInput id='password-current' labelText={copy.currentPassword} showPasswordLabel={copy.showPassword} hidePasswordLabel={copy.hidePassword} autoComplete='current-password' value={current} onChange={(event) => setCurrent(event.target.value)} />
                <PasswordInput
                    id='password-next'
                    labelText={copy.newPassword}
                    showPasswordLabel={copy.showPassword}
                    hidePasswordLabel={copy.hidePassword}
                    autoComplete='new-password'
                    helperText={copy.passwordHelper}
                    value={next}
                    invalid={short}
                    invalidText={copy.passwordShort}
                    onChange={(event) => setNext(event.target.value)}
                />
            </div>
            {change.error ? <p className='text-[0.75rem] text-danger'>{accountError(change.error)}</p> : null}
            <div className='flex items-center gap-4'>
                <Button type='submit' kind='tertiary' size='md' disabled={current === '' || next.length < 8 || change.loading}>
                    {copy.changePassword}
                </Button>
                {change.loading ? <InlineLoading description={copy.changing} className='w-auto' /> : null}
                {done ? <InlineLoading status='finished' description={copy.changed} className='w-auto' /> : null}
            </div>
        </form>
    );
};

export default PasswordForm;
