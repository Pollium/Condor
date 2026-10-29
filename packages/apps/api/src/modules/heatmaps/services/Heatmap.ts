import ClickGrid from './ClickGrid';
import HeatEvents from './HeatEvents';
import HeatSnapshotService from './HeatSnapshot';
import ScrollReachService from './ScrollReach';
import Project from '@/modules/projects/models/Project';
import Event from '@/modules/tracking/models/Event';
import { Heatmap, HeatmapQuery, HeatWidth } from '@condor/contracts/heatmaps/domain';
import { resolveWindow } from '@/shared/time/period-window';
import { HeatScope } from '../contracts/domain/heatmap';

const MEDIAN = 0.5;

const TYPICAL_VIEWPORT: Record<HeatWidth, number> = {
    desktop: 1440,
    tablet: 820,
    mobile: 390
};

interface StatsRow{
    clicks: string;
    sessions: string;
    viewportWidth: number | null;
    documentHeight: number | null;
    averageDepth: number | null;
}

export default class HeatmapService{
    #events = new HeatEvents();
    #grid = new ClickGrid();
    #reach = new ScrollReachService();
    #snapshot = new HeatSnapshotService();

    async read(project: Project, query: Required<HeatmapQuery>): Promise<Heatmap>{
        const window = await resolveWindow(Event.getRepository().manager, query.period, project.settings.timezone);
        const scope: HeatScope = {
            projectId: project.id,
            path: query.path,
            from: window.from,
            width: query.width
        };
        const [stats, points, elements, reach, snapshot] = await Promise.all([
            this.#stats(scope, query.mode === 'rage'),
            this.#grid.points(scope, query.mode),
            this.#grid.elements(scope),
            this.#reach.read(scope),
            this.#snapshot.latest(scope)
        ]);

        return {
            path: query.path,
            mode: query.mode,
            width: query.width,
            period: query.period,
            sessions: Number(stats.sessions),
            clicks: Number(stats.clicks),
            averageDepth: stats.averageDepth ?? 0,
            viewportWidth: stats.viewportWidth ?? TYPICAL_VIEWPORT[query.width],
            documentHeight: stats.documentHeight ?? 0,
            points,
            elements,
            reach,
            snapshot
        };
    }

    async #stats(scope: HeatScope, rageOnly: boolean): Promise<StatsRow>{
        const median = this.#events.param(2);
        const [row] = await this.#events.query<StatsRow>(scope, `
            SELECT
                COUNT(*) FILTER (WHERE type = 'click' AND (NOT ${this.#events.param(1)} OR rage)) AS clicks,
                COUNT(DISTINCT "sessionId") FILTER (WHERE type = 'pageview') AS sessions,
                percentile_disc(${median}) WITHIN GROUP (ORDER BY width) AS "viewportWidth",
                percentile_disc(${median}) WITHIN GROUP (ORDER BY "documentHeight") AS "documentHeight",
                AVG(value) FILTER (WHERE type = 'pageleave') AS "averageDepth"
            FROM scoped
        `, [rageOnly, MEDIAN]);

        return row;
    }
}
