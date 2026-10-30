import type es from '@/modules/team/i18n/es';
import { fmt } from '@/shared/utils/format';

const en: typeof es = {
    roles: {
        owner: 'Owner',
        admin: 'Admin',
        viewer: 'Viewer'
    },
    roleHints: {
        owner: 'Everything, including the team',
        admin: 'Apps, settings and errors',
        viewer: 'Read only'
    },
    page: {
        title: 'Team',
        people: (count: number) => count === 1 ? '1 person' : `${fmt.n(count)} people`,
        members: 'People',
        loading: 'Loading the team…',
        ownerOnly: 'Only an owner can change roles or remove someone.',
        invite: 'Invite',
        adminInvites: 'As an admin you can only invite viewers.',
        pending: 'Pending invitations'
    },
    memberList: {
        you: 'you',
        neverSignedIn: 'never signed in',
        signedIn: (ago: string) => `signed in ${ago}`,
        saving: 'Saving…',
        roleOf: (name: string) => `Role for ${name}`,
        remove: (name: string) => `Remove ${name}`
    },
    removeMember: {
        heading: (name: string) => `Remove ${name}?`,
        confirm: 'Remove from team',
        cancel: 'Cancel',
        removing: 'Removing…',
        body: (email: string) => `${email} loses access to Condor right away. Coming back will take a new invitation.`
    },
    inviteForm: {
        email: 'Email',
        emailPlaceholder: 'person@company.com',
        emailInvalid: 'Check the email',
        role: 'Role',
        inviting: 'Inviting…',
        invite: 'Invite',
        created: 'Invitation created',
        createdHint: (email: string, day: string) => `Send this link to ${email}. It is only shown now and expires on ${day}.`,
        done: 'Done',
        copyLink: 'Copy link'
    },
    invitationList: {
        expired: (day: string) => `expired on ${day}`,
        expires: (day: string) => `expires on ${day}`,
        revoke: 'Revoke'
    },
    errors: {
        memberNotFound: 'That person is no longer on the team.',
        lastOwner: 'The team needs at least one owner.',
        cannotChangeSelf: 'You cannot change your own role or remove yourself from the team.',
        invitationNotFound: 'That invitation no longer exists.',
        invitationExpired: 'The invitation has expired.',
        alreadyMember: 'That person is already on the team.',
        emailTaken: 'That email already has a Condor account.'
    }
};

export default en;
