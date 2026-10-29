import Session from '@/modules/sessions/models/Session';
import { tableRef } from '@readable/utils/models/table-ref';
import { SessionSignal } from '@condor/contracts/sessions/domain';
import { Slice } from '@condor/contracts/shared/analytics';
import { BreakdownScope, BreakdownSlices } from '../../contracts/domain/breakdown';

type FrustrationRow = Record<SessionSignal | 'total', string>;

const SIGNALS: SessionSignal[] = ['rage', 'dead', 'error', 'uturn'];

export default class FrustrationSlices{
    async read(scope: BreakdownScope): Promise<BreakdownSlices>{
        const manager = Session.getRepository().manager;
        const sessions = tableRef(manager, Session);

        const [row] = await manager.query<FrustrationRow[]>(`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE s."rageClicks" > 0) AS rage,
                COUNT(*) FILTER (WHERE s."deadClicks" > 0) AS dead,
                COUNT(*) FILTER (WHERE s.errors > 0) AS error,
                COUNT(*) FILTER (WHERE s.uturns > 0) AS uturn
            FROM ${sessions.table} s
            WHERE s."projectId" = $1 AND s."startedAt" >= $2
        `, [scope.projectId, scope.from]);

        const slices: Slice[] = SIGNALS.map((signal) => ({
            id: signal,
            label: signal,
            value: Number(row[signal])
        }));

        return {
            total: Number(row.total),
            slices: slices.sort((left, right) => right.value - left.value)
        };
    }
}
