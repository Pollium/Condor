import Session from '@/modules/sessions/models/Session';
import { tableRef } from '@readable/utils/models/table-ref';
import RankedSlices from './RankedSlices';
import { BreakdownScope, BreakdownSlices, SessionColumn } from '../../contracts/domain/breakdown';

interface ColumnSql{
    label: string;
    detail: string;
    secondary: string;
}

const NO_DETAIL = 'NULL::text';
const NO_SECONDARY = 'NULL::bigint';

const plain = (label: string): ColumnSql => ({
    label,
    detail: NO_DETAIL,
    secondary: NO_SECONDARY
});

const COLUMNS: Record<SessionColumn, ColumnSql> = {
    country: plain('s.country'),
    city: {
        label: 's.city',
        detail: 's.country',
        secondary: NO_SECONDARY
    },
    language: plain('s.language'),
    os: plain('s.os'),
    browser: plain('s.browser'),
    device: plain('s.device'),
    screen: plain(`s."screenWidth" || 'x' || s."screenHeight"`),
    connection: plain('s.connection'),
    channel: plain('s.channel'),
    source: plain('s.source'),
    campaign: {
        label: 's."utmCampaign"',
        detail: 's."utmSource"',
        secondary: NO_SECONDARY
    },
    release: {
        label: 's.release',
        detail: NO_DETAIL,
        secondary: 'COUNT(*) FILTER (WHERE errors > 0)'
    }
};

export default class ColumnSlices{
    #ranked = new RankedSlices();

    read(scope: BreakdownScope, column: SessionColumn): Promise<BreakdownSlices>{
        const sessions = tableRef(Session.getRepository().manager, Session);
        const { label, detail, secondary } = COLUMNS[column];

        return this.#ranked.read({
            source: `
                SELECT ${label} AS label, ${detail} AS detail, s.errors
                FROM ${sessions.table} s
                WHERE s."projectId" = $1 AND s."startedAt" >= $2
            `,
            ranked: `
                SELECT concat_ws(':', detail, label) AS id, label, detail, COUNT(*) AS value, ${secondary} AS secondary
                FROM scoped
                WHERE label IS NOT NULL
                GROUP BY label, detail
                ORDER BY value DESC, label, detail
                LIMIT $3
            `
        }, scope);
    }
}
