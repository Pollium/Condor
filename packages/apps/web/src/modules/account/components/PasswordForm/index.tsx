import { Button, InlineLoading, PasswordInput } from '@carbon/react';
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
                <PasswordInput id='password-current' labelText='Contraseña actual' autoComplete='current-password' value={current} onChange={(event) => setCurrent(event.target.value)} />
                <PasswordInput
                    id='password-next'
                    labelText='Contraseña nueva'
                    autoComplete='new-password'
                    helperText='Al menos 8 caracteres.'
                    value={next}
                    invalid={short}
                    invalidText='Usa al menos 8 caracteres.'
                    onChange={(event) => setNext(event.target.value)}
                />
            </div>
            {change.error ? <p className='text-[0.75rem] text-danger'>{accountError(change.error)}</p> : null}
            <div className='flex items-center gap-4'>
                <Button type='submit' kind='tertiary' size='md' disabled={current === '' || next.length < 8 || change.loading}>
                    Cambiar la contraseña
                </Button>
                {change.loading ? <InlineLoading description='Cambiando…' className='w-auto' /> : null}
                {done ? <InlineLoading status='finished' description='Contraseña cambiada' className='w-auto' /> : null}
            </div>
        </form>
    );
};

export default PasswordForm;
