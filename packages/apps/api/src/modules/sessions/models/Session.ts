import BaseModel from '@readable/models/BaseModel';
import { Channel, Device } from '@condor/contracts/shared/analytics';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['projectId', 'startedAt'])
@Index(['projectId', 'endedAt'])
@Index(['projectId', 'personKey'])
@Index(['personId', 'startedAt'])
export default class Session extends BaseModel{
    @Column('uuid')
    projectId!: string;

    @Column('uuid')
    personId!: string;

    @Column('varchar')
    personKey!: string;

    @Column('varchar')
    anonymousId!: string;

    @Column({ type: 'varchar', nullable: true })
    userId!: string | null;

    @Column('timestamptz')
    startedAt!: Date;

    @Column('timestamptz')
    endedAt!: Date;

    @Column({ type: 'integer', default: 0 })
    duration!: number;

    @Column({ type: 'integer', default: 0 })
    activeDuration!: number;

    @Column({ type: 'integer', default: 0 })
    pageviews!: number;

    @Column({ type: 'integer', default: 0 })
    events!: number;

    @Column({ type: 'integer', default: 0 })
    clicks!: number;

    @Column({ type: 'integer', default: 0 })
    rageClicks!: number;

    @Column({ type: 'integer', default: 0 })
    deadClicks!: number;

    @Column({ type: 'integer', default: 0 })
    errors!: number;

    @Column({ type: 'integer', default: 0 })
    uturns!: number;

    @Column({ type: 'real', default: 0 })
    scrollDepth!: number;

    @Column({ type: 'varchar', nullable: true })
    entryPath!: string | null;

    @Column({ type: 'varchar', nullable: true })
    exitPath!: string | null;

    @Column({ type: 'varchar', default: 'direct' })
    channel!: Channel;

    @Column({ type: 'varchar', nullable: true })
    source!: string | null;

    @Column({ type: 'varchar', nullable: true })
    referrer!: string | null;

    @Column({ type: 'varchar', nullable: true })
    referrerHost!: string | null;

    @Column({ type: 'varchar', nullable: true })
    utmSource!: string | null;

    @Column({ type: 'varchar', nullable: true })
    utmMedium!: string | null;

    @Column({ type: 'varchar', nullable: true })
    utmCampaign!: string | null;

    @Column({ type: 'varchar', nullable: true })
    country!: string | null;

    @Column({ type: 'varchar', nullable: true })
    region!: string | null;

    @Column({ type: 'varchar', nullable: true })
    city!: string | null;

    @Column({ type: 'varchar', nullable: true })
    language!: string | null;

    @Column({ type: 'varchar', nullable: true })
    timezone!: string | null;

    @Column({ type: 'varchar', nullable: true })
    os!: string | null;

    @Column({ type: 'varchar', nullable: true })
    osVersion!: string | null;

    @Column({ type: 'varchar', nullable: true })
    browser!: string | null;

    @Column({ type: 'varchar', nullable: true })
    browserVersion!: string | null;

    @Column({ type: 'varchar', default: 'desktop' })
    device!: Device;

    @Column({ type: 'integer', nullable: true })
    screenWidth!: number | null;

    @Column({ type: 'integer', nullable: true })
    screenHeight!: number | null;

    @Column({ type: 'integer', nullable: true })
    viewportWidth!: number | null;

    @Column({ type: 'varchar', nullable: true })
    connection!: string | null;

    @Column({ type: 'varchar', nullable: true })
    release!: string | null;

    @Column({ type: 'varchar', default: '' })
    sdk!: string;

    @Column({ type: 'integer', default: 1 })
    sequence!: number;

    @Column({ type: 'boolean', default: false })
    converted!: boolean;

    @Column({ type: 'boolean', default: false })
    hasReplay!: boolean;

    @Column({ type: 'integer', default: 0 })
    replayBytes!: number;
}
