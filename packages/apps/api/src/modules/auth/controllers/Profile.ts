import ProfileService from '../services/Profile';
import AuthenticatedController from '@readable/auth/AuthenticatedController';
import { CurrentUser } from '@readable/auth/CurrentUser';
import { Body } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { ChangePasswordInput, UpdateProfileInput } from '@condor/contracts/auth/http';
import { authRoutes } from '@condor/contracts/auth/routes';

export default class ProfileController extends AuthenticatedController{
    #service = new ProfileService();

    @Route(authRoutes.me)
    me(@CurrentUser() userId: string){
        return this.#service.get(userId);
    }

    @Route(authRoutes.updateProfile)
    update(@CurrentUser() userId: string, @Body() body: UpdateProfileInput){
        return this.#service.update(userId, body);
    }

    @Route(authRoutes.changePassword)
    changePassword(@CurrentUser() userId: string, @Body() body: ChangePasswordInput){
        return this.#service.changePassword(userId, body);
    }
}
