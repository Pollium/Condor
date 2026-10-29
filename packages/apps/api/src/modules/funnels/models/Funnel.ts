import BaseModel from '@readable/models/BaseModel';
import { FunnelStep } from '@condor/contracts/funnels/domain';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['projectId'])
export default class Funnel extends BaseModel{
    @Column('uuid')
    projectId!: string;

    @Column('varchar')
    name!: string;

    @Column('jsonb')
    steps!: FunnelStep[];

    @Column({ type: 'integer', default: 24 })
    windowHours!: number;
}
