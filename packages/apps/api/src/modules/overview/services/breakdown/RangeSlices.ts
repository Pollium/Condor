import Session from '@/modules/sessions/models/Session';
import { tableRef } from '@readable/utils/models/table-ref';
import { BreakdownScope, BreakdownSlices, RangeDimension, SliceRange } from '../../contracts/domain/breakdown';

interface RangeRow{
    bucket: number;
    value: string;
}

const RANGES: Record<RangeDimension, SliceRange[]> = {
    frequency: [
        { id: '1', from: 1 },
        { id: '2-3', from: 2 },
        { id: '4-9', from: 4 },
        { id: '10+', from: 10 }
    ],
    duration: [
        { id: '<10s', from: 0 },
        { id: '10-30s', from: 10 },
        { id: '30s-1m', from: 30 },
        { id: '1-3m', from: 60 },
        { id: '3-10m', from: 180 },
        { id: '10-30m', from: 600 },
        { id: '>30m', from: 1800 }
    ],
    depth: [
        { id: '1', from: 0 },
        { id: '2', from: 2 },
        { id: '3', from: 3 },
        { id: '4-5', from: 4 },
        { id: '6-10', from: 6 },
        { id: '11+', from: 11 }
    ]
};

const MEASURES: Record<RangeDimension, string> = {
    frequency: 'SELECT COUNT(*)::int AS measure FROM sessions GROUP BY "personKey"',
    duration: 'SELECT duration AS measure FROM sessions',
    depth: 'SELECT pageviews AS measure FROM sessions'
};

export default class RangeSlices{
    async read(scope: BreakdownScope, dimension: RangeDimension): Promise<BreakdownSlices>{
        const manager = Session.getRepository().manager;
        const table = tableRef(manager, Session).table;
        const ranges = RANGES[dimension];

        const rows = await manager.query<RangeRow[]>(`
            WITH sessions AS (
                SELECT s."personKey", s.duration, s.pageviews
                FROM ${table} s
                WHERE s."projectId" = $1 AND s."startedAt" >= $2
            )
            SELECT width_bucket(measure, $3::int[]) AS bucket, COUNT(*) AS value
            FROM (${MEASURES[dimension]}) measured
            GROUP BY 1
        `, [scope.projectId, scope.from, ranges.slice(1).map((range) => range.from)]);
        const byBucket = new Map(rows.map((row) => [row.bucket, Number(row.value)]));

        const slices = ranges.map((range, index) => ({
            id: range.id,
            label: range.id,
            value: byBucket.get(index) ?? 0
        }));

        return {
            total: slices.reduce((sum, slice) => sum + slice.value, 0),
            slices
        };
    }
}
