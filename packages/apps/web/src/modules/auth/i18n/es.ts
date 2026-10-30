export default {
    fields: {
        name: 'Tu nombre',
        nameMissing: 'Escribe tu nombre',
        email: 'Correo',
        emailInvalid: 'Escribe un correo válido',
        password: 'Contraseña',
        passwordHelper: 'Al menos 8 caracteres',
        passwordShort: 'Usa al menos 8 caracteres',
        showPassword: 'Mostrar la contraseña',
        hidePassword: 'Ocultar la contraseña'
    },
    signIn: {
        title: 'Entrar a Condor',
        lead: 'Usa la cuenta que te creó quien administra esta instalación.',
        submitting: 'Entrando…',
        submit: 'Entrar'
    },
    setup: {
        title: 'Configura Condor',
        lead: 'Crea la cuenta del dueño de esta instalación. Después podrás invitar a tu equipo.',
        submitting: 'Creando…',
        submit: 'Crear la cuenta'
    },
    invitation: {
        invalid: 'Invitación no válida',
        goToSignIn: 'Ir a entrar',
        title: 'Únete a Condor',
        lead: (invitedBy: string, role: string) => `${invitedBy} te invitó como ${role}.`,
        loading: 'Cargando la invitación…',
        submitting: 'Creando tu cuenta…',
        submit: 'Crear mi cuenta'
    },
    errors: {
        setupClosed: 'Esta instalación ya tiene dueño. Entra con tu cuenta.',
        invalidCredentials: 'El correo o la contraseña no coinciden.',
        invitationNotFound: 'Esta invitación no existe o ya se usó.',
        invitationExpired: 'Esta invitación venció. Pide una nueva.',
        alreadyMember: 'Este correo ya tiene una cuenta. Entra con ella.'
    }
};
