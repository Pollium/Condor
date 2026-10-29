import { uuidv7 } from '../utils/uuidv7';
import { getHiddenFields } from './Hidden';
import { BaseEntity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export default abstract class BaseModel extends BaseEntity{
    @PrimaryColumn({ type: 'uuid', default: () => 'uuidv7()' })
    id: string = uuidv7();

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    toJSON(): Record<string, unknown>{
        const hidden = getHiddenFields(this.constructor);
        const output: Record<string, unknown> = {};
        for(const [key, value] of Object.entries(this)){
            if(!hidden.has(key)){
                output[key] = value;
            }
        }
        return output;
    }
}
