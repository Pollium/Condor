import { BaseEntity } from '../shared/base';

export type Role = 'owner' | 'admin' | 'viewer';

export interface AuthUser extends BaseEntity{
    email: string;
    name: string;
    role: Role;
    lastSignInAt: string | null;
}

export interface AuthSession{
    token: string;
    user: AuthUser;
}

export interface SetupStatus{
    needsOwner: boolean;
}
