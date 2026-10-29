import BaseModel from '@readable/models/BaseModel';
import { Platform, ProjectSettings } from '@condor/contracts/projects/domain';
import { Column, Entity } from 'typeorm';

@Entity()
export default class Project extends BaseModel{
    @Column('varchar')
    name!: string;

    @Column('varchar')
    host!: string;

    @Column({ type: 'varchar', default: 'web' })
    platform!: Platform;

    @Column('varchar')
    tint!: string;

    @Column({ type: 'varchar', unique: true })
    publicKey!: string;

    @Column('jsonb')
    settings!: ProjectSettings;

    @Column({ type: 'timestamptz', nullable: true })
    lastEventAt!: Date | null;
}
