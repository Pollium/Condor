import Session from '@/modules/sessions/models/Session';
import { Slice } from '@condor/contracts/shared/analytics';
import { BreakdownScope, BreakdownSlices, RankedSql } from '../../contracts/domain/breakdown';

interface RankedGroup{
    total: string;
    id: string;
    label: string;
    detail: string | null;
    value: string;
    secondary: string | null;
}

type RankedRow = RankedGroup | Record<keyof RankedGroup, string | null>;

const isGroup = (row: RankedRow): row is RankedGroup => row.id !== null;

export default class RankedSlices{
    async read(sql: RankedSql, scope: BreakdownScope): Promise<BreakdownSlices>{
        const rows = await Session.getRepository().manager.query<RankedRow[]>(`
            WITH scoped AS (${sql.source})
            SELECT totals.total, ranked.id, ranked.label, ranked.detail, ranked.value, ranked.secondary
            FROM (SELECT COUNT(*) AS total FROM scoped) totals
            LEFT JOIN LATERAL (${sql.ranked}) ranked ON true
            ORDER BY ranked.value DESC, ranked.label, ranked.id
        `, [scope.projectId, scope.from, scope.limit]);

        return {
            total: Number(rows[0].total),
            slices: rows.filter(isGroup).map((row) => this.#slice(row))
        };
    }

    #slice(row: RankedGroup): Slice{
        return {
            id: row.id,
            label: row.label,
            value: Number(row.value),
            ...(row.detail === null ? {} : { detail: row.detail }),
            ...(row.secondary === null ? {} : { secondary: Number(row.secondary) })
        };
    }
}
