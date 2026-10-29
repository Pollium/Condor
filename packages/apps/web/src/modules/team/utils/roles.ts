import { Role } from '@condor/contracts/auth/domain';

export const ROLE_LABEL: Record<Role, string> = {
    owner: 'Dueño',
    admin: 'Admin',
    viewer: 'Lector'
};

export const ROLE_HINT: Record<Role, string> = {
    owner: 'Todo, incluido el equipo',
    admin: 'Apps, ajustes y errores',
    viewer: 'Solo lectura'
};
