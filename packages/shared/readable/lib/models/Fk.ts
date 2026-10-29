import { getMetadataArgsStorage, Column } from 'typeorm';

export interface FkOptions{
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    nullable?: boolean;
    name?: string;
}

export const Fk = (entity: string, options: FkOptions = {}): PropertyDecorator =>
    (target, propertyKey) => {
        const column = String(propertyKey);
        const join = options.name ?? column;
        const relation = column.endsWith('Id') ? column.slice(0, -2) : `_${column}`;
        const nullable = options.nullable === true;

        Column({ type: 'uuid', ...(nullable ? { nullable: true } : {}) })(target, column);

        getMetadataArgsStorage().relations.push({
            target: target.constructor,
            propertyName: relation,
            relationType: 'many-to-one',
            isLazy: false,
            type: entity,
            options: {
                ...(options.onDelete === undefined ? {} : { onDelete: options.onDelete }),
                nullable
            }
        });

        getMetadataArgsStorage().joinColumns.push({
            target: target.constructor,
            propertyName: relation,
            name: join,
            referencedColumnName: 'id'
        });
    };
