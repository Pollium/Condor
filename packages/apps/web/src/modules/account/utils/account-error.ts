import { errorCopy } from '@/shared/utils/error-copy';

export const accountError = errorCopy({
    'Auth::EmailTaken': 'Ese correo ya lo usa otra persona del equipo.',
    'Auth::WrongPassword': 'La contraseña actual no es correcta.',
    'Auth::InvalidCredentials': 'La contraseña actual no es correcta.'
});
