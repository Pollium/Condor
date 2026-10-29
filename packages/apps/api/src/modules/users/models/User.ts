import BaseModel from '@readable/models/BaseModel';
import { Hidden } from '@readable/models/Hidden';
import { Role } from '@condor/contracts/auth/domain';
import { Entity, Column } from 'typeorm';

const ROLES: Role[] = ['owner', 'admin', 'viewer'];

@Entity()
export default class User extends BaseModel{
    @Column({
        type: 'varchar',
        unique: true
    })
    email!: string;

    @Column('varchar')
    name!: string;

    @Column('varchar')
    @Hidden()
    passwordHash!: string;

    @Column({
        type: 'simple-enum',
        enum: ROLES
    })
    role!: Role;

    @Column({
        type: Date,
        nullable: true
    })
    lastSignInAt!: Date | null;
}
