import Project from '@/modules/projects/models/Project';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { Vital } from '@condor/contracts/overview/domain';
import { VitalName, VitalRating } from '@condor/contracts/shared/analytics';
import { Period } from '@condor/contracts/shared/period';
import { resolveWindow } from '@/shared/time/period-window';

interface VitalThreshold{
    good: number;
    poor: number;
}

interface VitalRow{
    name: VitalName;
    p75: number;
    good: string;
    samples: string;
}

const THRESHOLDS: Record<VitalName, VitalThreshold> = {
    LCP: {
        good: 2500,
        poor: 4000
    },
    INP: {
        good: 200,
        poor: 500
    },
    CLS: {
        good: 0.1,
        poor: 0.25
    },
    FCP: {
        good: 1800,
        poor: 3000
    },
    TTFB: {
        good: 800,
        poor: 1800
    }
};

const VITALS = Object.keys(THRESHOLDS) as VitalName[];

const P75 = 0.75;

const ratingOf = (name: VitalName, value: number): VitalRating => {
    const threshold = THRESHOLDS[name];
    if(value <= threshold.good) return 'good';
    if(value <= threshold.poor) return 'needs-improvement';
    return 'poor';
};

export default class VitalsService{
    async read(project: Project, period: Period): Promise<Vital[]>{
        const manager = Event.getRepository().manager;
        const events = tableRef(manager, Event);
        const window = await resolveWindow(manager, period, project.settings.timezone);

        const rows = await manager.query<VitalRow[]>(`
            SELECT
                limits.name,
                percentile_cont($5) WITHIN GROUP (ORDER BY e.value) AS p75,
                AVG((e.value <= limits.good)::int) AS good,
                COUNT(*) AS samples
            FROM ${events.table} e
            JOIN unnest($3::text[], $4::float8[]) AS limits(name, good) ON limits.name = e.name
            WHERE e."projectId" = $1 AND e.type = 'vital' AND e.timestamp >= $2 AND e.value IS NOT NULL
            GROUP BY limits.name
        `, [project.id, window.from, VITALS, VITALS.map((name) => THRESHOLDS[name].good), P75]);
        const byName = new Map(rows.map((row) => [row.name, row]));

        return VITALS.flatMap((name) => {
            const row = byName.get(name);
            if(row === undefined) return [];

            return [{
                name,
                p75: row.p75,
                good: Number(row.good),
                rating: ratingOf(name, row.p75),
                samples: Number(row.samples)
            }];
        });
    }
}
