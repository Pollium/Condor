import AuthService from '../services/Auth';
import BaseController from '@readable/controllers/BaseController';
import { Body } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Status } from '@readable/decorators/controllers/Status';
import { RateLimit } from '@readable/decorators/middleware/RateLimit';
import { SetupInput, SignInInput } from '@condor/contracts/auth/http';
import { authRoutes } from '@condor/contracts/auth/routes';

export default class AuthController extends BaseController{
    #service = new AuthService();

    @Route(authRoutes.setupStatus)
    setupStatus(){
        return this.#service.setupStatus();
    }

    @Route(authRoutes.setup)
    @Status(201)
    setup(@Body() body: SetupInput){
        return this.#service.setup(body);
    }

    @Route(authRoutes.signIn)
    @RateLimit({ max: 5, window: '1m' })
    signIn(@Body() body: SignInInput){
        return this.#service.signIn(body);
    }
}
