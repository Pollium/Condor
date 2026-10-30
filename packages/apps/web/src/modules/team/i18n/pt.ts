import type es from '@/modules/team/i18n/es';
import { fmt } from '@/shared/utils/format';

const pt: typeof es = {
    roles: {
        owner: 'Proprietário',
        admin: 'Admin',
        viewer: 'Leitor'
    },
    roleHints: {
        owner: 'Tudo, inclusive a equipe',
        admin: 'Apps, configurações e erros',
        viewer: 'Somente leitura'
    },
    page: {
        title: 'Equipe',
        people: (count: number) => count === 1 ? '1 pessoa' : `${fmt.n(count)} pessoas`,
        members: 'Pessoas',
        loading: 'Carregando a equipe…',
        ownerOnly: 'Só um proprietário pode mudar funções ou remover alguém.',
        invite: 'Convidar',
        adminInvites: 'Como admin, você só pode convidar leitores.',
        pending: 'Convites pendentes'
    },
    memberList: {
        you: 'você',
        neverSignedIn: 'nunca entrou',
        signedIn: (ago: string) => `entrou ${ago}`,
        saving: 'Salvando…',
        roleOf: (name: string) => `Função de ${name}`,
        remove: (name: string) => `Remover ${name}`
    },
    removeMember: {
        heading: (name: string) => `Remover ${name}?`,
        confirm: 'Remover da equipe',
        cancel: 'Cancelar',
        removing: 'Removendo…',
        body: (email: string) => `${email} perde o acesso ao Condor na hora. Para voltar, vai precisar de outro convite.`
    },
    inviteForm: {
        email: 'E-mail',
        emailPlaceholder: 'pessoa@empresa.com.br',
        emailInvalid: 'Confira o e-mail',
        role: 'Função',
        inviting: 'Convidando…',
        invite: 'Convidar',
        created: 'Convite criado',
        createdHint: (email: string, day: string) => `Envie este link para ${email}. Ele só aparece agora e expira em ${day}.`,
        done: 'Pronto',
        copyLink: 'Copiar link'
    },
    invitationList: {
        expired: (day: string) => `expirou em ${day}`,
        expires: (day: string) => `expira em ${day}`,
        revoke: 'Revogar'
    },
    errors: {
        memberNotFound: 'Essa pessoa não está mais na equipe.',
        lastOwner: 'A equipe precisa de pelo menos um proprietário.',
        cannotChangeSelf: 'Você não pode mudar sua própria função nem se remover da equipe.',
        invitationNotFound: 'Esse convite não existe mais.',
        invitationExpired: 'O convite já expirou.',
        alreadyMember: 'Essa pessoa já faz parte da equipe.',
        emailTaken: 'Esse e-mail já tem uma conta no Condor.'
    }
};

export default pt;
