import type es from '@/modules/account/i18n/es';

const en: typeof es = {
    title: 'Your account',
    profile: 'Profile',
    loading: 'Loading…',
    name: 'Name',
    nameMissing: 'Enter your name',
    email: 'Email',
    emailInvalid: 'Check the email',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved',
    password: 'Password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    passwordHelper: 'At least 8 characters.',
    passwordShort: 'Use at least 8 characters.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    changePassword: 'Change the password',
    changing: 'Changing…',
    changed: 'Password changed',
    appearance: 'Appearance',
    appearanceHint: 'System follows the light or dark mode of your device.',
    themes: {
        light: 'Light',
        dark: 'Dark',
        system: 'System'
    },
    language: 'Language',
    languageHint: 'The console reloads in the language you pick. It only changes in this browser.',
    session: 'Session',
    signOut: 'Sign out',
    signOutHint: 'Signs you out in this browser.',
    errors: {
        emailTaken: 'Someone else on the team already uses that email.',
        wrongPassword: 'The current password is not correct.'
    }
};

export default en;
