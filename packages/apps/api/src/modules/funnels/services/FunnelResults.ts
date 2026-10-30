import Funnel from '../models/Funnel';
import FunnelService from './Funnel';
import FunnelProgressQuery from './FunnelProgress';
import Project from '@/modules/projects/models/Project';
import { FunnelResult, FunnelStepResult } from '@condor/contracts/funnels/domain';
import { resolveWindow } from '@/shared/time/period-window';
import { FunnelProgress, FunnelResultFilter } from '../contracts/domain/funnel';

const shareOf = (part: number, whole: number): number => whole === 0 ? 0 : part / whole;

const conversionOf = (people: number[]): number => shareOf(people[people.length - 1], people[0]);

export default class FunnelResultsService{
    #funnels = new FunnelService();
    #progress = new FunnelProgressQuery();

    async read(project: Project, funnelId: string, filter: FunnelResultFilter): Promise<FunnelResult>{
        const funnel = await this.#funnels.find(project, funnelId);
        const window = await resolveWindow(Funnel.getRepository().manager, filter.period, project.settings.timezone);
        const windowHours = filter.windowHours ?? funnel.windowHours;
        const run = {
            projectId: project.id,
            steps: funnel.steps,
            windowHours,
            segment: filter.segment
        };
        const [current, previous] = await Promise.all([
            this.#progress.run({ ...run, from: window.from, until: window.to }),
            this.#progress.run({ ...run, from: window.previousFrom, until: window.from })
        ]);

        return {
            funnelId: funnel.id,
            period: filter.period,
            windowHours,
            conversion: conversionOf(current.people),
            previousConversion: conversionOf(previous.people),
            medianSeconds: current.medianFromStart,
            steps: this.#steps(funnel, current),
            byDevice: current.byDevice
        };
    }

    #steps(funnel: Funnel, progress: FunnelProgress): FunnelStepResult[]{
        const entered = progress.people[0];

        return funnel.steps.map((step, index) => {
            const people = progress.people[index];
            const before = index === 0 ? entered : progress.people[index - 1];

            return {
                ...step,
                people,
                fromStart: shareOf(people, entered),
                fromPrevious: shareOf(people, before),
                medianSeconds: progress.medianFromPrevious[index]
            };
        });
    }
}
