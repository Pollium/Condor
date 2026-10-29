import { errorCopy } from '@/shared/utils/error-copy';

export const teamError = errorCopy({
    'Member::NotFound': 'Esa persona ya no está en el equipo.',
    'Member::LastOwner': 'El equipo necesita al menos un dueño.',
    'Member::CannotChangeSelf': 'No puedes cambiar tu propio rol ni quitarte del equipo.',
    'Invitation::NotFound': 'Esa invitación ya no existe.',
    'Invitation::Expired': 'La invitación ya venció.',
    'Invitation::AlreadyMember': 'Esa persona ya es parte del equipo.',
    'Auth::EmailTaken': 'Ese correo ya tiene una cuenta en Condor.'
});
