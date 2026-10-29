import User from '@/modules/users/models/User';
import { advisoryLock } from '@readable/utils/models/advisory-lock';
import { UpdateMemberInput } from '@condor/contracts/members/http';
import { MemberError } from '../contracts/domain/errors';
import { EntityManager } from 'typeorm';

const OWNERS_LOCK_NAMESPACE = 4101;
const OWNERS_LOCK_KEY = 'owners';

export default class MemberService{
    list(): Promise<User[]>{
        return User.find({ order: { createdAt: 'ASC' } });
    }

    async update(actorId: string, userId: string, input: UpdateMemberInput): Promise<User>{
        this.#assertOther(actorId, userId);

        return this.#withOwnersLocked(async (manager) => {
            const member = await this.#find(manager, userId);
            if(input.role !== 'owner') await this.#assertNotLastOwner(manager, member);

            member.role = input.role;
            return manager.save(member);
        });
    }

    async remove(actorId: string, userId: string){
        this.#assertOther(actorId, userId);

        await this.#withOwnersLocked(async (manager) => {
            const member = await this.#find(manager, userId);
            await this.#assertNotLastOwner(manager, member);
            await manager.remove(member);
        });
    }

    #assertOther(actorId: string, userId: string){
        if(actorId === userId) throw MemberError.CannotChangeSelf();
    }

    #withOwnersLocked<T>(work: (manager: EntityManager) => Promise<T>): Promise<T>{
        return User.getRepository().manager.transaction(async (manager) => {
            await advisoryLock(manager, OWNERS_LOCK_NAMESPACE, OWNERS_LOCK_KEY);
            return work(manager);
        });
    }

    async #find(manager: EntityManager, userId: string): Promise<User>{
        const member = await manager.findOneBy(User, { id: userId });
        if(member === null) throw MemberError.NotFound();

        return member;
    }

    async #assertNotLastOwner(manager: EntityManager, member: User){
        if(member.role !== 'owner') return;
        if(await manager.countBy(User, { role: 'owner' }) <= 1) throw MemberError.LastOwner();
    }
}
