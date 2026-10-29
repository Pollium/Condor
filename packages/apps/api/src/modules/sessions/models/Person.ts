import BaseModel from '@readable/models/BaseModel';
import { Traits } from '@condor/contracts/shared/analytics';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity()
@Unique(['projectId', 'anonymousId'])
@Index(['projectId', 'userId'])
@Index(['projectId', 'lastSeenAt'])
@Index(['projectId', 'firstSeenAt'])
export default class Person extends BaseModel{
    @Column('uuid')
    projectId!: string;

    @Column('varchar')
    anonymousId!: string;

    @Column({ type: 'varchar', nullable: true })
    userId!: string | null;

    @Column({ type: 'varchar', nullable: true })
    name!: string | null;

    @Column({ type: 'varchar', nullable: true })
    email!: string | null;

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    traits!: Traits;

    @Column('timestamptz')
    firstSeenAt!: Date;

    @Column('timestamptz')
    lastSeenAt!: Date;

    @Column({ type: 'integer', default: 0 })
    sessions!: number;
}
