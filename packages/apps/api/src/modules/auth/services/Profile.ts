import User from '@/modules/users/models/User';
import PasswordService from '@readable/auth/PasswordService';
import { findOrThrow } from '@readable/utils/models/find-or-throw';
import { isUniqueViolation } from '@readable/utils/models/is-unique-violation';
import { ChangePasswordInput, UpdateProfileInput } from '@condor/contracts/auth/http';
import { AuthError } from '../contracts/domain/errors';

export default class ProfileService{
    #password = new PasswordService();

    get(userId: string): Promise<User>{
        return findOrThrow(User, { id: userId }, AuthError.Unauthorized);
    }

    async update(userId: string, patch: UpdateProfileInput): Promise<User>{
        const user = await this.get(userId);
        user.name = patch.name ?? user.name;
        user.email = patch.email?.toLowerCase() ?? user.email;

        try{
            return await user.save();
        }catch(error: unknown){
            if(isUniqueViolation(error)) throw AuthError.EmailTaken();
            throw error;
        }
    }

    async changePassword(userId: string, input: ChangePasswordInput){
        const user = await this.get(userId);
        if(!(await this.#password.verify(input.current, user.passwordHash))) throw AuthError.WrongPassword();

        user.passwordHash = await this.#password.hash(input.next);
        await user.save();
    }
}
