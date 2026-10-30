import { Button, InlineLoading, TextInput } from '@carbon/react';
import { AuthUser } from '@condor/contracts/auth/domain';
import { copy } from '@/modules/account/i18n';
import { accountError } from '@/modules/account/utils/account-error';
import { authApi } from '@/modules/auth/api/api';
import { fieldErrors } from '@/shared/utils/error-copy';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { useState, type FormEvent } from 'react';

interface ProfileFormProps{
    user: AuthUser;
    onSaved: () => void;
}

const ProfileForm = ({ user, onSaved }: ProfileFormProps) => {
    const update = useMutation(authApi.updateProfile);
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [saved, setSaved] = useState(false);
    const fields = fieldErrors(update.error);
    const changed = name.trim() !== user.name || email.trim() !== user.email;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setSaved(false);
        const body = {
            ...(name.trim() !== user.name ? { name: name.trim() } : {}),
            ...(email.trim() !== user.email ? { email: email.trim() } : {})
        };
        if(await update.run(body).then(() => true, () => false)){
            setSaved(true);
            onSaved();
        }
    };

    return (
        <form onSubmit={submit} className='flex flex-col gap-4'>
            <div className='grid gap-x-6 gap-y-4 sm:grid-cols-2'>
                <TextInput id='profile-name' labelText={copy.name} autoComplete='name' value={name} invalid={fields.name !== undefined} invalidText={copy.nameMissing} onChange={(event) => setName(event.target.value)} />
                <TextInput id='profile-email' type='email' labelText={copy.email} autoComplete='email' value={email} invalid={fields.email !== undefined} invalidText={copy.emailInvalid} onChange={(event) => setEmail(event.target.value)} />
            </div>
            {update.error ? <p className='text-[0.75rem] text-danger'>{accountError(update.error)}</p> : null}
            <div className='flex items-center gap-4'>
                <Button type='submit' kind='tertiary' size='md' disabled={!changed || name.trim() === '' || update.loading}>
                    {copy.save}
                </Button>
                {update.loading ? <InlineLoading description={copy.saving} className='w-auto' /> : null}
                {saved && !changed ? <InlineLoading status='finished' description={copy.saved} className='w-auto' /> : null}
            </div>
        </form>
    );
};

export default ProfileForm;
