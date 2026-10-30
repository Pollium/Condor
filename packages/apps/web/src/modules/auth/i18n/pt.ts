import type es from '@/modules/auth/i18n/es';

const pt: typeof es = {
    fields: {
        name: 'Seu nome',
        nameMissing: 'Escreva seu nome',
        email: 'E-mail',
        emailInvalid: 'Escreva um e-mail válido',
        password: 'Senha',
        passwordHelper: 'Pelo menos 8 caracteres',
        passwordShort: 'Use pelo menos 8 caracteres',
        showPassword: 'Mostrar a senha',
        hidePassword: 'Ocultar a senha'
    },
    signIn: {
        title: 'Entrar no Condor',
        lead: 'Use a conta que quem administra esta instalação criou para você.',
        submitting: 'Entrando…',
        submit: 'Entrar'
    },
    setup: {
        title: 'Configure o Condor',
        lead: 'Crie a conta do proprietário desta instalação. Depois você poderá convidar sua equipe.',
        submitting: 'Criando…',
        submit: 'Criar a conta'
    },
    invitation: {
        invalid: 'Convite inválido',
        goToSignIn: 'Ir para o login',
        title: 'Junte-se ao Condor',
        lead: (invitedBy: string, role: string) => `${invitedBy} convidou você como ${role}.`,
        loading: 'Carregando o convite…',
        submitting: 'Criando sua conta…',
        submit: 'Criar minha conta'
    },
    errors: {
        setupClosed: 'Esta instalação já tem um proprietário. Entre com sua conta.',
        invalidCredentials: 'O e-mail e a senha não conferem.',
        invitationNotFound: 'Este convite não existe ou já foi usado.',
        invitationExpired: 'Este convite expirou. Peça um novo.',
        alreadyMember: 'Este e-mail já tem uma conta. Entre com ela.'
    }
};

export default pt;
