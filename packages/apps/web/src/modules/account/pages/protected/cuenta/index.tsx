import { Button, InlineLoading } from '@carbon/react';
import PasswordForm from '@/modules/account/components/PasswordForm';
import ProfileForm from '@/modules/account/components/ProfileForm';
import ThemeChoice from '@/modules/account/components/ThemeChoice';
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
            <PageHeader title='Tu cuenta' hint={user === null ? undefined : `${ROLE_LABEL[user.role]} · ${ROLE_HINT[user.role].toLowerCase()}`} />
            <Section title='Perfil'>
                {user === null ? (
                    me.error ? <p className='text-[0.875rem] text-danger'>{accountError(me.error)}</p> : <InlineLoading description='Cargando…' />
                ) : (
                    <ProfileForm key={`${user.name}|${user.email}`} user={user} onSaved={me.reload} />
                )}
            </Section>
            <Section title='Contraseña'>
                <PasswordForm />
            </Section>
            <Section title='Apariencia' aside={<ThemeChoice />}>
                <p className='-mt-2 text-[0.75rem] text-label-2'>Sistema sigue el modo claro u oscuro de tu equipo.</p>
            </Section>
            <Section title='Sesión' aside={<Button kind='danger--ghost' size='sm' onClick={signOut} className='-mr-4'>Cerrar sesión</Button>}>
                <p className='-mt-2 text-[0.75rem] text-label-2'>Cierra la sesión en este navegador.</p>
            </Section>
        </div>
    );
};

export default AccountPage;
