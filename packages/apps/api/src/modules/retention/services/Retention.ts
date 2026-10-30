import Person from '@/modules/sessions/models/Person';
import Project from '@/modules/projects/models/Project';
import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { Cohort, Retention, RetentionGrain } from '@condor/contracts/retention/domain';
import { CohortCounts, RetentionFilter } from '../contracts/domain/retention';

const DAYS_PER_PERIOD: Record<RetentionGrain, number> = {
    day: 1,
    week: 7
};

interface CohortRow{
    start: string;
    elapsed: number | null;
    total: boolean;
    people: string;
}

const shareOf = (part: number, whole: number): number => whole === 0 ? 0 : part / whole;

export default class RetentionService{
    async read(project: Project, filter: RetentionFilter): Promise<Retention>{
        const counts = this.#counts(await this.#rows(project, filter), filter.cohorts);
        const cohorts: Cohort[] = counts.map((cohort) => ({
            start: cohort.start,
            size: cohort.size,
            values: cohort.retained.map((people) => shareOf(people, cohort.size))
        }));

        return {
            grain: filter.grain,
            returnEvent: filter.returnEvent,
            cohorts,
            average: this.#average(counts, filter.cohorts)
        };
    }

    #counts(rows: CohortRow[], cohorts: number): CohortCounts[]{
        const starts = [...new Set(rows.map((row) => row.start))];

        return starts.map((start, index) => {
            const size = Number(rows.find((row) => row.start === start && row.total)?.people ?? 0);
            const retained = Array.from({ length: cohorts - index }, (_, elapsed) => {
                if(elapsed === 0) return size;
                return Number(rows.find((row) => row.start === start && !row.total && row.elapsed === elapsed)?.people ?? 0);
            });

            return { start, size, retained };
        });
    }

    #average(counts: CohortCounts[], periods: number): number[]{
        return Array.from({ length: periods }, (_, elapsed) => {
            const reached = counts.filter((cohort) => cohort.retained.length > elapsed);
            const people = reached.reduce((sum, cohort) => sum + cohort.retained[elapsed], 0);
            const size = reached.reduce((sum, cohort) => sum + cohort.size, 0);
            return shareOf(people, size);
        });
    }

    #rows(project: Project, filter: RetentionFilter): Promise<CohortRow[]>{
        const manager = Person.getRepository().manager;
        const people = tableRef(manager, Person);
        const sessions = tableRef(manager, Session);
        const events = tableRef(manager, Event);

        return manager.query<CohortRow[]>(`
            WITH bounds AS (
                SELECT
                    date_trunc($2, now() AT TIME ZONE $3) - ($4::int - 1) * ('1 ' || $2)::interval AS first,
                    date_trunc($2, now() AT TIME ZONE $3) AS last,
                    ('1 ' || $2)::interval AS step
            ),
            starts AS (
                SELECT generate_series(first, last, step) AS start FROM bounds
            ),
            cohort AS (
                SELECT p.id, date_trunc($2, p."firstSeenAt" AT TIME ZONE $3) AS start
                FROM ${people.table} p, bounds
                WHERE p."projectId" = $1 AND p."firstSeenAt" >= bounds.first AT TIME ZONE $3
                    AND ($7::text IS NULL OR p.traits ->> $7::text = $8::text)
            ),
            activity AS (
                SELECT s."personId" AS id, date_trunc($2, s."startedAt" AT TIME ZONE $3) AS period
                FROM ${sessions.table} s, bounds
                WHERE $5::text IS NULL AND s."projectId" = $1 AND s."startedAt" >= bounds.first AT TIME ZONE $3
                UNION
                SELECT e."personId", date_trunc($2, e.timestamp AT TIME ZONE $3)
                FROM ${events.table} e, bounds
                WHERE e."projectId" = $1 AND e.type = 'custom' AND e.name = $5::text AND e.timestamp >= bounds.first AT TIME ZONE $3
            )
            SELECT to_char(start, 'YYYY-MM-DD') AS start, elapsed, GROUPING(elapsed) = 1 AS total, COUNT(DISTINCT id) AS people
            FROM (
                SELECT starts.start, cohort.id, (activity.period::date - starts.start::date) / $6 AS elapsed
                FROM starts
                LEFT JOIN cohort ON cohort.start = starts.start
                LEFT JOIN activity ON activity.id = cohort.id AND activity.period >= cohort.start
            ) joined
            GROUP BY GROUPING SETS ((start), (start, elapsed))
            ORDER BY start
        `, [
            project.id,
            filter.grain,
            project.settings.timezone,
            filter.cohorts,
            filter.returnEvent,
            DAYS_PER_PERIOD[filter.grain],
            filter.segment?.key ?? null,
            filter.segment?.value ?? null
        ]);
    }
}
