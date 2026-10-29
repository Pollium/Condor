import BaseModel from '@readable/models/BaseModel';
import { Device, EventType, Traits } from '@condor/contracts/shared/analytics';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['projectId', 'timestamp'])
@Index(['projectId', 'type', 'timestamp'])
@Index(['projectId', 'type', 'name', 'timestamp'])
@Index(['projectId', 'path', 'type', 'timestamp'])
@Index(['sessionId', 'timestamp'])
export default class Event extends BaseModel{
    @Column('uuid')
    projectId!: string;

    @Column({ type: 'uuid', nullable: true })
    sessionId!: string | null;

    @Column({ type: 'uuid', nullable: true })
    personId!: string | null;

    @Column('varchar')
    type!: EventType;

    @Column({ type: 'varchar', nullable: true })
    name!: string | null;

    @Column('varchar')
    path!: string;

    @Column('varchar')
    rawPath!: string;

    @Column({ type: 'varchar', nullable: true })
    title!: string | null;

    @Column('timestamptz')
    timestamp!: Date;

    @Column({ type: 'real', nullable: true })
    x!: number | null;

    @Column({ type: 'real', nullable: true })
    y!: number | null;

    @Column({ type: 'integer', nullable: true })
    viewportWidth!: number | null;

    @Column({ type: 'integer', nullable: true })
    documentHeight!: number | null;

    @Column({ type: 'varchar', nullable: true })
    selector!: string | null;

    @Column({ type: 'varchar', nullable: true })
    text!: string | null;

    @Column({ type: 'double precision', nullable: true })
    value!: number | null;

    @Column({ type: 'boolean', default: false })
    rage!: boolean;

    @Column({ type: 'boolean', default: false })
    dead!: boolean;

    @Column({ type: 'varchar', nullable: true })
    device!: Device | null;

    @Column({ type: 'varchar', nullable: true })
    release!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    props!: Traits | null;
}
