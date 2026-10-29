import ValidationError from '@readable/errors/Validation';
import { Period, PERIODS } from '@condor/contracts/shared/period';
import { EntityManager } from 'typeorm';

export type Grain = 'hour' | 'day' | 'week';

export interface PeriodWindow{
    period: Period;
    grain: Grain;
    timezone: string;
    from: Date;
    to: Date;
    previousFrom: Date;
    buckets: string[];
}

interface WindowRow{
    from: Date;
    to: Date;
    previousFrom: Date;
    buckets: string[];
}

const SPANS: Record<Period, { grain: Grain; count: number }> = {
    '24h': { grain: 'hour', count: 24 },
    '7d': { grain: 'day', count: 7 },
    '30d': { grain: 'day', count: 30 },
    '90d': { grain: 'week', count: 13 }
};

export const parsePeriod = (raw: unknown, fallback: Period = '7d'): Period => {
    if(raw === undefined || raw === '') return fallback;
    if(typeof raw === 'string' && (PERIODS as readonly string[]).includes(raw)) return raw as Period;
    throw new ValidationError({ period: 'Invalid period' });
};

export const resolveWindow = async (manager: EntityManager, period: Period, timezone: string): Promise<PeriodWindow> => {
    const { grain, count } = SPANS[period];
    const [row] = await manager.query<WindowRow[]>(`
        WITH anchor AS (
            SELECT date_trunc($1, now() AT TIME ZONE $2) AS local_now, ('1 ' || $1)::interval AS step
        )
        SELECT
            (local_now - ($3::int - 1) * step) AT TIME ZONE $2 AS "from",
            now() AS "to",
            (local_now - (2 * $3::int - 1) * step) AT TIME ZONE $2 AS "previousFrom",
            ARRAY(
                SELECT to_char(bucket, 'YYYY-MM-DD"T"HH24:MI:SS')
                FROM generate_series(local_now - ($3::int - 1) * step, local_now, step) AS bucket
            ) AS buckets
        FROM anchor
    `, [grain, timezone, count]);

    return {
        period,
        grain,
        timezone,
        from: row.from,
        to: row.to,
        previousFrom: row.previousFrom,
        buckets: row.buckets
    };
};
