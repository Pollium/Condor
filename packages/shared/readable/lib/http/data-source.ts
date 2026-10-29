import { ReadableDatabaseConfig } from '../config';
import { DataSource } from 'typeorm';

export interface MigrationSource{
    migrations: Function[];
    tableName: string;
}

export const createDataSource = (
    database: ReadableDatabaseConfig,
    entities: Function[],
    migrations?: MigrationSource
): DataSource =>
    new DataSource({
        type: 'postgres',
        url: database.url,
        schema: database.schema,
        synchronize: database.synchronize,
        entities,
        migrations: migrations?.migrations ?? [],
        ...(migrations === undefined ? {} : {
            migrationsTableName: migrations.tableName,
            migrationsTransactionMode: 'all' as const
        })
    });
