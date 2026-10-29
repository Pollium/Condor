import { ConfigError } from '../errors/ConfigError';
import { DataSource } from 'typeorm';

export const requireTestSchema = (schema: string | undefined): string => {
    if(!schema || schema === 'public') throw ConfigError.MissingEnv('DATABASE_SCHEMA');
    return schema;
};

export const truncateSchema = async (dataSource: DataSource, schema: string) => {
    const rows: Array<{ tablename: string }> = await dataSource.query(
        'SELECT tablename FROM pg_tables WHERE schemaname = $1',
        [schema]
    );
    if(rows.length === 0) return;

    const tables = rows.map((row) => `"${schema}"."${row.tablename}"`).join(', ');
    await dataSource.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
};
