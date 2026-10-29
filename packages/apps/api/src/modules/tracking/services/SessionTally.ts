import { IngestEvent } from '@/modules/tracking/contracts/domain/queue';
import { eventsOfType, SessionTally } from '../contracts/domain/ingest';

const MS_PER_SECOND = 1000;

export default class SessionTallyService{
    of(events: IngestEvent[], conversionEvent: string | null): SessionTally{
        const ordered = [...events].sort((left, right) => left.timestamp - right.timestamp);
        const pageviews = eventsOfType(ordered, 'pageview');
        const clicks = eventsOfType(ordered, 'click');
        const leaves = eventsOfType(ordered, 'pageleave');
        const entry = pageviews.at(0);
        const exit = pageviews.at(-1);

        return {
            firstAt: new Date(ordered[0].timestamp),
            lastAt: new Date(ordered[ordered.length - 1].timestamp),
            events: ordered.length,
            pageviews: pageviews.length,
            clicks: clicks.length,
            rageClicks: clicks.filter((click) => click.rage).length,
            deadClicks: clicks.filter((click) => click.dead).length,
            errors: eventsOfType(ordered, 'error').length,
            uturns: pageviews.filter((pageview) => pageview.uturn === true).length,
            activeSeconds: Math.round(leaves.reduce((sum, leave) => sum + leave.activeMs, 0) / MS_PER_SECOND),
            scrollDepth: Math.max(0, ...leaves.map((leave) => leave.scrollDepth)),
            entryPath: entry?.path ?? null,
            exitPath: exit?.path ?? null,
            exitAt: exit === undefined ? null : new Date(exit.timestamp),
            attribution: entry?.attribution ?? null,
            converted: conversionEvent !== null
                && eventsOfType(ordered, 'custom').some((custom) => custom.name === conversionEvent)
        };
    }
}
