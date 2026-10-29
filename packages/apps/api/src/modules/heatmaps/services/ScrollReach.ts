import HeatEvents from './HeatEvents';
import { ScrollReach } from '@condor/contracts/heatmaps/domain';
import { HeatScope } from '../contracts/domain/heatmap';

const DEPTH_STEP = 5;
const FULL_DEPTH = 100;
const DEPTHS = Array.from({ length: FULL_DEPTH / DEPTH_STEP + 1 }, (_, index) => index * DEPTH_STEP);

interface ReachRow{
    depth: number;
    share: number;
}

export default class ScrollReachService{
    #events = new HeatEvents();

    async read(scope: HeatScope): Promise<ScrollReach[]>{
        const rows = await this.#events.query<ReachRow>(scope, `
            SELECT depth, AVG((leaves.value >= depth / ${this.#events.param(2)}::float8)::int)::float8 AS share
            FROM unnest(${this.#events.param(1)}::int[]) AS depth
            CROSS JOIN (SELECT value FROM scoped WHERE type = 'pageleave' AND value IS NOT NULL) leaves
            GROUP BY depth
        `, [DEPTHS, FULL_DEPTH]);
        const byDepth = new Map(rows.map((row) => [row.depth, row.share]));

        return DEPTHS.map((depth) => ({
            depth,
            share: byDepth.get(depth) ?? 0
        }));
    }
}
