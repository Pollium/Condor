import BaseModel from '@readable/models/BaseModel';
import { IssueStatus } from '@condor/contracts/issues/domain';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity()
@Unique(['projectId', 'fingerprint'])
@Index(['projectId', 'lastSeenAt'])
export default class Issue extends BaseModel{
    @Column('uuid')
    projectId!: string;

    @Column('varchar')
    fingerprint!: string;

    @Column('varchar')
    errorType!: string;

    @Column('text')
    message!: string;

    @Column({ type: 'varchar', nullable: true })
    source!: string | null;

    @Column({ type: 'text', nullable: true })
    stack!: string | null;

    @Column({ type: 'varchar', default: 'open' })
    status!: IssueStatus;

    @Column({ type: 'integer', default: 0 })
    occurrences!: number;

    @Column('timestamptz')
    firstSeenAt!: Date;

    @Column('timestamptz')
    lastSeenAt!: Date;

    @Column({ type: 'varchar', nullable: true })
    firstRelease!: string | null;

    @Column({ type: 'varchar', nullable: true })
    lastRelease!: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    resolvedAt!: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    regressedAt!: Date | null;
}
