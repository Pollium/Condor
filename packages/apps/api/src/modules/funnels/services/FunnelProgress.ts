import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { FunnelDeviceResult } from '@condor/contracts/funnels/domain';
import { Device } from '@condor/contracts/shared/analytics';
import { FunnelProgress, FunnelRun } from '../contracts/domain/funnel';

const MEDIAN = 0.5;

interface ProgressRow{
    total: boolean;
    device: Device | null;
    idx: number;
    people: string;
    fromPrevious: number | null;
    fromStart: number | null;
}

export default class FunnelProgressQuery{
    async run(run: FunnelRun): Promise<FunnelProgress>{
        const rows = await this.#rows(run);
        const totals = rows.filter((row) => row.total);
        const atStep = (index: number): ProgressRow | undefined => totals.find((row) => row.idx === index);
        const indexes = run.steps.map((_, index) => index);

        return {
            people: indexes.map((index) => Number(atStep(index)?.people ?? 0)),
            medianFromPrevious: indexes.map((index) => atStep(index)?.fromPrevious ?? null),
            medianFromStart: atStep(run.steps.length - 1)?.fromStart ?? null,
            byDevice: this.#byDevice(rows.filter((row) => !row.total), run.steps.length)
        };
    }

    #byDevice(rows: ProgressRow[], steps: number): FunnelDeviceResult[]{
        const byDevice = new Map<Device, number[]>();
        for(const row of rows){
            if(row.device === null) continue;
            const people = byDevice.get(row.device) ?? Array.from({ length: steps }, () => 0);
            people[row.idx] = Number(row.people);
            byDevice.set(row.device, people);
        }

        return [...byDevice.entries()]
            .map(([device, people]) => ({ device, people }))
            .sort((left, right) => right.people[0] - left.people[0] || left.device.localeCompare(right.device));
    }

    #reached(index: number): string{
        return `
            reached${index} AS (
                SELECT DISTINCT ON (previous."personKey")
                    previous."personKey", previous.device, previous."startedAt",
                    hit.timestamp AS "reachedAt", previous."reachedAt" AS "previousAt"
                FROM reached${index - 1} previous
                JOIN hits hit ON hit."personKey" = previous."personKey"
                    AND hit.idx = ${index}
                    AND hit.timestamp >= previous."reachedAt"
                    AND hit.timestamp <= previous."startedAt" + make_interval(hours => $6)
                ORDER BY previous."personKey", hit.timestamp
            )`;
    }

    #rows(run: FunnelRun): Promise<ProgressRow[]>{
        const manager = Event.getRepository().manager;
        const events = tableRef(manager, Event);
        const sessions = tableRef(manager, Session);
        const later = run.steps.slice(1).map((_, offset) => offset + 1);

        return manager.query<ProgressRow[]>(`
            WITH steps AS (
                SELECT (ordinality - 1)::int AS idx, kind, match
                FROM unnest($2::text[], $3::text[]) WITH ORDINALITY AS step(kind, match, ordinality)
            ),
            hits AS MATERIALIZED (
                SELECT steps.idx, s."personKey", s.device, e.timestamp
                FROM ${events.table} e
                JOIN steps ON (steps.kind = 'page' AND e.type = 'pageview' AND e.path = steps.match)
                    OR (steps.kind = 'event' AND e.type = 'custom' AND e.name = steps.match)
                JOIN ${sessions.table} s ON s.id = e."sessionId"
                WHERE e."projectId" = $1
                    AND e.type IN ('pageview', 'custom')
                    AND e.timestamp >= $4
                    AND e.timestamp < $5::timestamptz + make_interval(hours => $6)
            ),
            reached0 AS (
                SELECT DISTINCT ON ("personKey")
                    "personKey", device, timestamp AS "startedAt", timestamp AS "reachedAt", NULL::timestamptz AS "previousAt"
                FROM hits
                WHERE idx = 0 AND timestamp < $5
                ORDER BY "personKey", timestamp
            ),
            ${later.map((index) => this.#reached(index)).join(',')},
            progress AS (
                ${[0, ...later].map((index) => `SELECT ${index} AS idx, * FROM reached${index}`).join(' UNION ALL ')}
            )
            SELECT
                GROUPING(device) = 1 AS total,
                device,
                idx,
                COUNT(*) AS people,
                percentile_cont($7) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM "reachedAt" - "previousAt")) AS "fromPrevious",
                percentile_cont($7) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM "reachedAt" - "startedAt")) AS "fromStart"
            FROM progress
            GROUP BY GROUPING SETS ((idx), (device, idx))
        `, [
            run.projectId,
            run.steps.map((step) => step.kind),
            run.steps.map((step) => step.match),
            run.from,
            run.until,
            run.windowHours,
            MEDIAN
        ]);
    }
}
