import { get, patch, post } from '../shared/routing';
import { AuthSession, AuthUser, SetupStatus } from './domain';
import { ChangePasswordInput, SetupInput, SignInInput, UpdateProfileInput } from './http';

export const authRoutes = {
    setupStatus: get<SetupStatus>('/auth/setup'),
    setup: post<SetupInput, AuthSession>('/auth/setup'),
    signIn: post<SignInInput, AuthSession>('/auth/sign-in'),
    me: get<AuthUser>('/auth/me'),
    updateProfile: patch<UpdateProfileInput, AuthUser>('/auth/me'),
    changePassword: post<ChangePasswordInput>('/auth/me/password')
};
