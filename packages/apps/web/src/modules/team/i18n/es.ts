import { fmt } from '@/shared/utils/format';

export default {
    roles: {
        owner: 'Dueño',
        admin: 'Admin',
        viewer: 'Lector'
    },
    roleHints: {
        owner: 'Todo, incluido el equipo',
        admin: 'Apps, ajustes y errores',
        viewer: 'Solo lectura'
    },
    page: {
        title: 'Equipo',
        people: (count: number) => count === 1 ? '1 persona' : `${fmt.n(count)} personas`,
        members: 'Personas',
        loading: 'Cargando el equipo…',
        ownerOnly: 'Solo un dueño puede cambiar roles o quitar a alguien.',
        invite: 'Invitar',
        adminInvites: 'Como admin solo puedes invitar lectores.',
        pending: 'Invitaciones pendientes'
    },
    memberList: {
        you: 'tú',
        neverSignedIn: 'nunca ha entrado',
        signedIn: (ago: string) => `entró ${ago}`,
        saving: 'Guardando…',
        roleOf: (name: string) => `Rol de ${name}`,
        remove: (name: string) => `Quitar a ${name}`
    },
    removeMember: {
        heading: (name: string) => `¿Quitar a ${name}?`,
        confirm: 'Quitar del equipo',
        cancel: 'Cancelar',
        removing: 'Quitando…',
        body: (email: string) => `${email} pierde el acceso a Condor en ese momento. Para volver necesitará otra invitación.`
    },
    inviteForm: {
        email: 'Correo',
        emailPlaceholder: 'persona@empresa.cl',
        emailInvalid: 'Revisa el correo',
        role: 'Rol',
        inviting: 'Invitando…',
        invite: 'Invitar',
        created: 'Invitación creada',
        createdHint: (email: string, day: string) => `Envía este enlace a ${email}. Solo se muestra ahora y vence el ${day}.`,
        done: 'Listo',
        copyLink: 'Copiar el enlace'
    },
    invitationList: {
        expired: (day: string) => `venció el ${day}`,
        expires: (day: string) => `vence el ${day}`,
        revoke: 'Revocar'
    },
    errors: {
        memberNotFound: 'Esa persona ya no está en el equipo.',
        lastOwner: 'El equipo necesita al menos un dueño.',
        cannotChangeSelf: 'No puedes cambiar tu propio rol ni quitarte del equipo.',
        invitationNotFound: 'Esa invitación ya no existe.',
        invitationExpired: 'La invitación ya venció.',
        alreadyMember: 'Esa persona ya es parte del equipo.',
        emailTaken: 'Ese correo ya tiene una cuenta en Condor.'
    }
};
