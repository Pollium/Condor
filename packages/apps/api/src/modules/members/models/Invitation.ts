import BaseModel from '@readable/models/BaseModel';
import { Hidden } from '@readable/models/Hidden';
import { InvitedRole } from '@condor/contracts/members/domain';
import { Entity, Column } from 'typeorm';

const INVITED_ROLES: InvitedRole[] = ['admin', 'viewer'];

@Entity()
export default class Invitation extends BaseModel{
    @Column('varchar')
    email!: string;

    @Column({
        type: 'simple-enum',
        enum: INVITED_ROLES
    })
    role!: InvitedRole;

    @Column('varchar')
    invitedBy!: string;

    @Column({
        type: 'varchar',
        unique: true
    })
    @Hidden()
    tokenHash!: string;

    @Column({
        type: Date
    })
    expiresAt!: Date;

    @Column({
        type: Date,
        nullable: true
    })
    @Hidden()
    acceptedAt!: Date | null;
}
