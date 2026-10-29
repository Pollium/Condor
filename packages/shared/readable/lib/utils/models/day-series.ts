import { tableRef } from './table-ref';
import { BaseEntity, EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';

export interface DayCount{
    date: string;
    count: number;
}

interface DayCountRow{
    date: string;
    count: string;
}

const SERIES = `
    generate_series(
        CURRENT_DATE - make_interval(days => $1::int),
        CURRENT_DATE,
        INTERVAL '1 day'
    ) AS series(day)`;

export const recentDates = async (manager: EntityManager, days: number): Promise<string[]> => {
    const rows = await manager.query<{ date: string }[]>(`
        SELECT to_char(series.day, 'YYYY-MM-DD') AS date
        FROM ${SERIES}
        ORDER BY series.day ASC
    `, [days - 1]);

    return rows.map((row) => row.date);
};

export const countPerDay = async (
    target: typeof BaseEntity & EntityTarget<ObjectLiteral>,
    property: string,
    days: number
): Promise<DayCount[]> => {
    const manager = target.getRepository().manager;
    const ref = tableRef(manager, target);
    const stamp = ref.column(property);

    const rows = await manager.query<DayCountRow[]>(`
        SELECT to_char(series.day, 'YYYY-MM-DD') AS date, COUNT(entry."${ref.primaryKey}") AS count
        FROM ${SERIES}
        LEFT JOIN ${ref.table} AS entry
            ON entry."${stamp}" >= series.day
            AND entry."${stamp}" < series.day + INTERVAL '1 day'
        GROUP BY series.day
        ORDER BY series.day ASC
    `, [days - 1]);

    return rows.map((row) => ({ date: row.date, count: Number(row.count) }));
};
