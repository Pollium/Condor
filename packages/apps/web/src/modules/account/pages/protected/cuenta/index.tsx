import { Button, InlineLoading } from '@carbon/react';
import LanguageChoice from '@/modules/account/components/LanguageChoice';
import PasswordForm from '@/modules/account/components/PasswordForm';
import ProfileForm from '@/modules/account/components/ProfileForm';
import ThemeChoice from '@/modules/account/components/ThemeChoice';
import { copy } from '@/modules/account/i18n';
import { accountError } from '@/modules/account/utils/account-error';
import { useMe } from '@/modules/auth/hooks/use-me';
import { ROLE_HINT, ROLE_LABEL } from '@/modules/team/utils/roles';
import { PageHeader, Section } from '@/shared/components/Page';
import { endSession } from '@condor/ui/services/end-session';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
    const me = useMe();
    const navigate = useNavigate();
    const user = me.data;

    const signOut = async () => {
        await endSession();
        navigate('/entrar');
    };

    return (
        <div className='mx-auto flex w-full max-w-2xl flex-col gap-10 pb-16 pt-2'>
            <PageHeader title={copy.title} hint={user === null ? undefined : `${ROLE_LABEL[user.role]} · ${ROLE_HINT[user.role].toLowerCase()}`} />
            <Section title={copy.profile}>
                {user === null ? (
                    me.error ? <p className='text-[0.875rem] text-danger'>{accountError(me.error)}</p> : <InlineLoading description={copy.loading} />
                ) : (
                    <ProfileForm key={`${user.name}|${user.email}`} user={user} onSaved={me.reload} />
                )}
            </Section>
            <Section title={copy.password}>
                <PasswordForm />
            </Section>
            <Section title={copy.appearance} aside={<ThemeChoice />}>
                <p className='-mt-2 text-[0.75rem] text-label-2'>{copy.appearanceHint}</p>
            </Section>
            <Section title={copy.language} aside={<LanguageChoice />}>
                <p className='-mt-2 text-[0.75rem] text-label-2'>{copy.languageHint}</p>
            </Section>
            <Section title={copy.session} aside={<Button kind='danger--ghost' size='sm' onClick={signOut} className='-mr-4'>{copy.signOut}</Button>}>
                <p className='-mt-2 text-[0.75rem] text-label-2'>{copy.signOutHint}</p>
            </Section>
        </div>
    );
};

export default AccountPage;
