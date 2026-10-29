import JourneyPathsQuery from './JourneyPaths';
import Project from '@/modules/projects/models/Project';
import Session from '@/modules/sessions/models/Session';
import { Journey, JOURNEY_EXIT, JourneyLink, JourneyNode } from '@condor/contracts/journeys/domain';
import { resolveWindow } from '@/shared/time/period-window';
import { JourneyFilter, StepCount } from '../contracts/domain/journey';

const nodeId = (step: number, path: string): string => `${step}:${path}`;

export default class JourneyService{
    #paths = new JourneyPathsQuery();

    async read(project: Project, filter: JourneyFilter): Promise<Journey>{
        const window = await resolveWindow(Session.getRepository().manager, filter.period, project.settings.timezone);
        const rows = await this.#paths.read(project.id, window.from, filter);
        const exits = filter.exits ? rows.exits : [];

        const nodes: JourneyNode[] = rows.nodes.map((node) => ({ id: nodeId(node.step, node.path), ...node }));
        const links: JourneyLink[] = rows.links.map((link) => ({
            source: nodeId(link.step, link.source),
            target: nodeId(link.step + 1, link.target),
            sessions: link.sessions
        }));

        return {
            period: filter.period,
            steps: filter.steps,
            start: filter.start,
            sessions: Number(rows.sessions),
            leftAfterFirst: Number(rows.leftAfterFirst),
            nodes: [...nodes, ...this.#exitNodes(exits)],
            links: [...links, ...exits.map((exit) => ({
                source: nodeId(exit.step, exit.path),
                target: nodeId(exit.step + 1, JOURNEY_EXIT),
                sessions: exit.sessions
            }))],
            routes: rows.routes
        };
    }

    #exitNodes(exits: StepCount[]): JourneyNode[]{
        const byStep = new Map<number, number>();
        for(const exit of exits){
            byStep.set(exit.step + 1, (byStep.get(exit.step + 1) ?? 0) + exit.sessions);
        }

        return [...byStep.entries()].map(([step, sessions]) => ({
            id: nodeId(step, JOURNEY_EXIT),
            step,
            path: JOURNEY_EXIT,
            sessions
        }));
    }
}
