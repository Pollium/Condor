import type es from '@/modules/auth/i18n/es';

const en: typeof es = {
    fields: {
        name: 'Your name',
        nameMissing: 'Enter your name',
        email: 'Email',
        emailInvalid: 'Enter a valid email',
        password: 'Password',
        passwordHelper: 'At least 8 characters',
        passwordShort: 'Use at least 8 characters',
        showPassword: 'Show password',
        hidePassword: 'Hide password'
    },
    signIn: {
        title: 'Sign in to Condor',
        lead: 'Use the account created for you by whoever runs this installation.',
        submitting: 'Signing in…',
        submit: 'Sign in'
    },
    setup: {
        title: 'Set up Condor',
        lead: 'Create the owner account for this installation. Then you can invite your team.',
        submitting: 'Creating…',
        submit: 'Create the account'
    },
    invitation: {
        invalid: 'Invalid invitation',
        goToSignIn: 'Go to sign in',
        title: 'Join Condor',
        lead: (invitedBy: string, role: string) => `${invitedBy} invited you to join as ${role}.`,
        loading: 'Loading the invitation…',
        submitting: 'Creating your account…',
        submit: 'Create my account'
    },
    errors: {
        setupClosed: 'This installation already has an owner. Sign in with your account.',
        invalidCredentials: 'The email and password do not match.',
        invitationNotFound: 'This invitation does not exist or was already used.',
        invitationExpired: 'This invitation has expired. Ask for a new one.',
        alreadyMember: 'This email already has an account. Sign in with it.'
    }
};

export default en;
