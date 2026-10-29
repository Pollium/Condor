import { authRoutes } from '@condor/contracts/auth/routes';
import { memberRoutes } from '@condor/contracts/members/routes';
import { ChangePasswordInput, SetupInput, SignInInput, UpdateProfileInput } from '@condor/contracts/auth/http';
import { AcceptInvitationInput } from '@condor/contracts/members/http';
import { call } from '@condor/ui/api/call';

export const authApi = {
    setupStatus: () => call(authRoutes.setupStatus, { fresh: true }),
    setup: (body: SetupInput) => call(authRoutes.setup, { body }),
    signIn: (body: SignInInput) => call(authRoutes.signIn, { body }),
    me: () => call(authRoutes.me),
    updateProfile: (body: UpdateProfileInput) => call(authRoutes.updateProfile, { body }),
    changePassword: (body: ChangePasswordInput) => call(authRoutes.changePassword, { body }),
    previewInvitation: (token: string) => call(memberRoutes.preview, { path: { token } }),
    acceptInvitation: (body: AcceptInvitationInput) => call(memberRoutes.accept, { body })
};
