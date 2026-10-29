import User from '@/modules/users/models/User';
import Invitation from '../models/Invitation';
import SessionService from '@/modules/auth/services/Session';
import PasswordService from '@readable/auth/PasswordService';
import { findOrThrow } from '@readable/utils/models/find-or-throw';
import { isUniqueViolation } from '@readable/utils/models/is-unique-violation';
import { InvitationPreview } from '@condor/contracts/members/domain';
import { AcceptInvitationInput, InviteInput } from '@condor/contracts/members/http';
import { AuthError } from '@/modules/auth/contracts/domain/errors';
import { Session } from '@/modules/auth/contracts/domain/session';
import { InvitationError } from '../contracts/domain/errors';
import { IssuedInvitation } from '../contracts/domain/invitation';
import { config } from '@/shared/config';
import { createHash, randomBytes } from 'node:crypto';
import { IsNull } from 'typeorm';

const HOUR_MS = 60 * 60 * 1000;
const TOKEN_BYTES = 32;

export default class InvitationService{
    #password = new PasswordService();
    #session = new SessionService();

    pending(): Promise<Invitation[]>{
        return Invitation.find({
            where: { acceptedAt: IsNull() },
            order: { createdAt: 'DESC' }
        });
    }

    async invite(inviterId: string, input: InviteInput): Promise<IssuedInvitation>{
        const inviter = await findOrThrow(User, { id: inviterId }, AuthError.Unauthorized);
        if(inviter.role !== 'owner' && input.role !== 'viewer') throw AuthError.Forbidden();

        const email = input.email.toLowerCase();
        if(await User.existsBy({ email })) throw InvitationError.AlreadyMember();

        await Invitation.delete({ email, acceptedAt: IsNull() });
        const token = randomBytes(TOKEN_BYTES).toString('base64url');
        const invitation = await Invitation.create({
            email,
            role: input.role,
            invitedBy: inviter.name,
            tokenHash: this.#hash(token),
            expiresAt: new Date(Date.now() + config.invitation.ttlHours * HOUR_MS),
            acceptedAt: null
        }).save();

        return { invitation, token };
    }

    async revoke(invitationId: string){
        const invitation = await findOrThrow(Invitation, { id: invitationId, acceptedAt: IsNull() }, InvitationError.NotFound);
        await invitation.remove();
    }

    async preview(token: string): Promise<InvitationPreview>{
        const invitation = await this.#open(token);

        return {
            email: invitation.email,
            role: invitation.role,
            invitedBy: invitation.invitedBy,
            expiresAt: invitation.expiresAt.toISOString()
        };
    }

    async accept(input: AcceptInvitationInput): Promise<Session>{
        const invitation = await this.#open(input.token);
        return this.#session.open(await this.#enroll(invitation, input));
    }

    async #open(token: string): Promise<Invitation>{
        const invitation = await findOrThrow(Invitation, { tokenHash: this.#hash(token), acceptedAt: IsNull() }, InvitationError.NotFound);
        if(invitation.expiresAt <= new Date()) throw InvitationError.Expired();

        return invitation;
    }

    async #enroll(invitation: Invitation, input: AcceptInvitationInput): Promise<User>{
        const passwordHash = await this.#password.hash(input.password);

        try{
            return await Invitation.getRepository().manager.transaction(async (manager) => {
                invitation.acceptedAt = new Date();
                await manager.save(invitation);

                return manager.save(User.create({
                    email: invitation.email,
                    name: input.name,
                    role: invitation.role,
                    passwordHash
                }));
            });
        }catch(error: unknown){
            if(isUniqueViolation(error)) throw InvitationError.AlreadyMember();
            throw error;
        }
    }

    #hash(token: string): string{
        return createHash('sha256').update(token).digest('hex');
    }
}
