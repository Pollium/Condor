import BaseModel from '@readable/models/BaseModel';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity()
@Unique(['sessionId', 'seq'])
@Index(['projectId', 'firstAt'])
export default class ReplayChunk extends BaseModel{
    @Column('uuid')
    projectId!: string;

    @Column('uuid')
    sessionId!: string;

    @Column('integer')
    seq!: number;

    @Column('varchar')
    storageKey!: string;

    @Column('integer')
    size!: number;

    @Column('integer')
    eventCount!: number;

    @Column('timestamptz')
    firstAt!: Date;

    @Column('timestamptz')
    lastAt!: Date;

    @Column({ type: 'boolean', default: false })
    hasFullSnapshot!: boolean;
}
