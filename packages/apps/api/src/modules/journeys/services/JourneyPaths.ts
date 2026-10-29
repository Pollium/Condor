import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { JOURNEY_OTHER } from '@condor/contracts/journeys/domain';
import { JourneyFilter, JourneyRows } from '../contracts/domain/journey';

const TOP_PATHS = 6;
const TOP_ROUTES = 10;

export default class JourneyPathsQuery{
    async read(projectId: string, from: Date, filter: JourneyFilter): Promise<JourneyRows>{
        const manager = Session.getRepository().manager;
        const sessions = tableRef(manager, Session);
        const events = tableRef(manager, Event);

        const [row] = await manager.query<JourneyRows[]>(`
            WITH views AS (
                SELECT
                    e."sessionId" AS sid, e.path, e.timestamp, e.id,
                    LAG(e.path) OVER (PARTITION BY e."sessionId" ORDER BY e.timestamp, e.id) AS previous
                FROM ${sessions.table} s
                JOIN ${events.table} e ON e."sessionId" = s.id AND e.type = 'pageview'
                WHERE s."projectId" = $1 AND s."startedAt" >= $2
            ),
            collapsed AS (
                SELECT sid, path, ROW_NUMBER() OVER (PARTITION BY sid ORDER BY timestamp, id) AS position
                FROM views
                WHERE previous IS DISTINCT FROM path
            ),
            anchors AS (
                SELECT sid, MIN(position) AS position
                FROM collapsed
                WHERE path = $3::text
                GROUP BY sid
            ),
            started AS (
                SELECT c.sid, c.path, (c.position - COALESCE(a.position, 1) + 1)::int AS step
                FROM collapsed c
                LEFT JOIN anchors a ON a.sid = c.sid
                WHERE $3::text IS NULL OR c.position >= a.position
            ),
            journey AS (
                SELECT sid, path, step, MAX(step) OVER (PARTITION BY sid) AS length
                FROM started
                WHERE step <= $4
            ),
            ranked AS (
                SELECT step, path, ROW_NUMBER() OVER (PARTITION BY step ORDER BY COUNT(*) DESC, path) AS rank
                FROM journey
                GROUP BY step, path
            ),
            labeled AS (
                SELECT j.sid, j.step, j.length, CASE WHEN r.rank <= $5 THEN j.path ELSE $6::text END AS node
                FROM journey j
                JOIN ranked r ON r.step = j.step AND r.path = j.path
            ),
            nodes AS (
                SELECT step, node, COUNT(*) AS sessions
                FROM labeled
                GROUP BY step, node
            ),
            links AS (
                SELECT here.step, here.node AS source, next.node AS target, COUNT(*) AS sessions
                FROM labeled here
                JOIN labeled next ON next.sid = here.sid AND next.step = here.step + 1
                GROUP BY here.step, here.node, next.node
            ),
            exits AS (
                SELECT step, node, COUNT(*) AS sessions
                FROM labeled
                WHERE step = length AND step < $4
                GROUP BY step, node
            ),
            routes AS (
                SELECT paths, COUNT(*) AS sessions
                FROM (SELECT sid, array_agg(path ORDER BY step) AS paths FROM journey GROUP BY sid) visits
                GROUP BY paths
                ORDER BY sessions DESC, paths
                LIMIT $7
            )
            SELECT
                (SELECT COUNT(DISTINCT sid) FROM journey) AS sessions,
                (SELECT COUNT(DISTINCT sid) FROM journey WHERE length = 1) AS "leftAfterFirst",
                COALESCE((
                    SELECT jsonb_agg(jsonb_build_object('step', step, 'path', node, 'sessions', sessions) ORDER BY step, sessions DESC, node)
                    FROM nodes
                ), '[]'::jsonb) AS nodes,
                COALESCE((
                    SELECT jsonb_agg(jsonb_build_object('step', step, 'source', source, 'target', target, 'sessions', sessions) ORDER BY step, sessions DESC, source, target)
                    FROM links
                ), '[]'::jsonb) AS links,
                COALESCE((
                    SELECT jsonb_agg(jsonb_build_object('step', step, 'path', node, 'sessions', sessions) ORDER BY step, sessions DESC, node)
                    FROM exits
                ), '[]'::jsonb) AS exits,
                COALESCE((
                    SELECT jsonb_agg(jsonb_build_object('paths', to_jsonb(paths), 'sessions', sessions) ORDER BY sessions DESC, paths)
                    FROM routes
                ), '[]'::jsonb) AS routes
        `, [projectId, from, filter.start, filter.steps, TOP_PATHS, JOURNEY_OTHER, TOP_ROUTES]);

        return row;
    }
}
