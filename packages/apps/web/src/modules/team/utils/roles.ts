import { Role } from '@condor/contracts/auth/domain';
import { copy } from '@/modules/team/i18n';

export const ROLE_LABEL: Record<Role, string> = {
    owner: copy.roles.owner,
    admin: copy.roles.admin,
    viewer: copy.roles.viewer
};

export const ROLE_HINT: Record<Role, string> = {
    owner: copy.roleHints.owner,
    admin: copy.roleHints.admin,
    viewer: copy.roleHints.viewer
};
