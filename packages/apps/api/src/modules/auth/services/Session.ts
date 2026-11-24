import User from '@/modules/users/models/User';
import { JWTService } from '@pollium/readable/auth/sessions';
import { Session } from '../contracts/domain/session';

export default class SessionService{
    #jwt = new JWTService();

    async open(user: User): Promise<Session>{
        user.lastSignInAt = new Date();
        await user.save();

        return {
            token: this.#jwt.sign(user.id),
            user
        };
    }
}
