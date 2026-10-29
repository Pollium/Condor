import Project from '@/modules/projects/models/Project';
import Session from '@/modules/sessions/models/Session';
import ColumnSlices from './ColumnSlices';
import EventSlices from './EventSlices';
import FrustrationSlices from './FrustrationSlices';
import PageSlices from './PageSlices';
import RangeSlices from './RangeSlices';
import { Breakdown, BreakdownQuery, Dimension } from '@condor/contracts/overview/domain';
import { resolveWindow } from '@/shared/time/period-window';
import { BreakdownScope, BreakdownSlices } from '../../contracts/domain/breakdown';

export default class BreakdownService{
    #columns = new ColumnSlices();
    #pages = new PageSlices();
    #events = new EventSlices();
    #frustration = new FrustrationSlices();
    #ranges = new RangeSlices();

    async read(project: Project, query: Required<BreakdownQuery>): Promise<Breakdown>{
        const window = await resolveWindow(Session.getRepository().manager, query.period, project.settings.timezone);
        const { total, slices } = await this.#slices({
            projectId: project.id,
            from: window.from,
            limit: query.limit
        }, query.dimension);

        return {
            dimension: query.dimension,
            period: query.period,
            total,
            slices
        };
    }

    #slices(scope: BreakdownScope, dimension: Dimension): Promise<BreakdownSlices>{
        switch(dimension){
            case 'page':
                return this.#pages.views(scope);
            case 'entry':
            case 'exit':
                return this.#pages.landing(scope, dimension);
            case 'event':
                return this.#events.read(scope);
            case 'frustration':
                return this.#frustration.read(scope);
            case 'frequency':
            case 'duration':
            case 'depth':
                return this.#ranges.read(scope, dimension);
            default:
                return this.#columns.read(scope, dimension);
        }
    }
}
