import User from '@/modules/users/models/User';
import SessionService from './Session';
import PasswordService from '@readable/auth/PasswordService';
import { advisoryLock } from '@readable/utils/models/advisory-lock';
import { SetupStatus } from '@condor/contracts/auth/domain';
import { SetupInput, SignInInput } from '@condor/contracts/auth/http';
import { AuthError } from '../contracts/domain/errors';
import { Session } from '../contracts/domain/session';

const SETUP_LOCK_NAMESPACE = 4101;
const SETUP_LOCK_KEY = 'owner-setup';

export default class AuthService{
    #password = new PasswordService();
    #session = new SessionService();

    async setupStatus(): Promise<SetupStatus>{
        return { needsOwner: !(await User.exists()) };
    }

    async setup(input: SetupInput): Promise<Session>{
        const owner = await User.getRepository().manager.transaction(async (manager) => {
            await advisoryLock(manager, SETUP_LOCK_NAMESPACE, SETUP_LOCK_KEY);
            if(await manager.exists(User)) throw AuthError.SetupClosed();

            return manager.save(User.create({
                email: input.email.toLowerCase(),
                name: input.name,
                passwordHash: await this.#password.hash(input.password),
                role: 'owner'
            }));
        });

        return this.#session.open(owner);
    }

    async signIn(input: SignInInput): Promise<Session>{
        const user = await User.findOneBy({ email: input.email.toLowerCase() });
        if(user === null || !(await this.#password.verify(input.password, user.passwordHash))){
            throw AuthError.InvalidCredentials();
        }

        return this.#session.open(user);
    }
}
