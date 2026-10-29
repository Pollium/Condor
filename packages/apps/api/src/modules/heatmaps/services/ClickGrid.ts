import HeatEvents from './HeatEvents';
import { HeatElement, HeatMode, HeatPoint } from '@condor/contracts/heatmaps/domain';
import { HeatScope } from '../contracts/domain/heatmap';

const GRID_COLUMNS = 200;
const GRID_ROW_PX = 8;
const CELL_CENTER = 0.5;
const POINT_LIMIT = 5000;
const ELEMENT_LIMIT = 25;

interface CellRow{
    cell: number;
    line: number;
    weight: string;
}

interface ElementRow{
    selector: string;
    text: string | null;
    clicks: string;
    rage: string;
    dead: string;
}

export default class ClickGrid{
    #events = new HeatEvents();

    async points(scope: HeatScope, mode: HeatMode): Promise<HeatPoint[]>{
        const columns = this.#events.param(1);
        const rows = await this.#events.query<CellRow>(scope, `
            SELECT
                LEAST(FLOOR(x * ${columns}), ${columns} - 1)::int AS cell,
                FLOOR(y / ${this.#events.param(2)})::int AS line,
                COUNT(*) AS weight
            FROM scoped
            WHERE type = 'click' AND x IS NOT NULL AND y IS NOT NULL AND (NOT ${this.#events.param(3)} OR rage)
            GROUP BY 1, 2
            ORDER BY weight DESC, 1, 2
            LIMIT ${this.#events.param(4)}
        `, [GRID_COLUMNS, GRID_ROW_PX, mode === 'rage', POINT_LIMIT]);

        return rows.map((row) => ({
            x: (row.cell + CELL_CENTER) / GRID_COLUMNS,
            y: (row.line + CELL_CENTER) * GRID_ROW_PX,
            weight: Number(row.weight)
        }));
    }

    async elements(scope: HeatScope): Promise<HeatElement[]>{
        const rows = await this.#events.query<ElementRow>(scope, `
            SELECT
                selector,
                mode() WITHIN GROUP (ORDER BY text) AS text,
                COUNT(*) AS clicks,
                COUNT(*) FILTER (WHERE rage) AS rage,
                COUNT(*) FILTER (WHERE dead) AS dead
            FROM scoped
            WHERE type = 'click' AND selector IS NOT NULL
            GROUP BY selector
            ORDER BY clicks DESC, selector
            LIMIT ${this.#events.param(1)}
        `, [ELEMENT_LIMIT]);

        return rows.map((row) => ({
            selector: row.selector,
            text: row.text,
            clicks: Number(row.clicks),
            rage: Number(row.rage),
            dead: Number(row.dead)
        }));
    }
}
