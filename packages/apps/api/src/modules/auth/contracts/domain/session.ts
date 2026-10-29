import User from '@/modules/users/models/User';

export interface Session{
    token: string;
    user: User;
}
