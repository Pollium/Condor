import Journey from './Journey';
import Random from './Random';
import VisitorRoster from './VisitorRoster';
import { ATTRIBUTIONS, CAMPAIGN, DIRECT, HISTORY_DAYS, LOCAL_HOUR_WEIGHTS, RELEASES } from './store';
import { DemoDay, Visit, Visitor, Weighted } from './types';
import { Attribution, EnrichedContext, IngestBatchJob } from '@/modules/tracking/contracts/domain/queue';

const SEED = 20_261_029;
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const SECONDS_PER_HOUR = 3600;
const MS_PER_SECOND = 1000;
const DELIVERY_DELAY_MS = 1500;
const SETTLED_MS = 10 * 60_000;
const RETURNING_DIRECT_CHANCE = 0.35;
const SLOW_CONNECTION_CHANCE = 0.1;
const SDK = 'condor-browser@0.1.0';

const HOURS: Weighted<number>[] = LOCAL_HOUR_WEIGHTS.map((weight, hour) => ({ value: hour, weight }));

export default class DemoHistory{
    #random = new Random(SEED);
    #journey = new Journey(this.#random);
    #projectId: string;
    #now: number;
    #firstDay: Date;

    constructor(projectId: string, now: number){
        const today = new Date(now);
        this.#projectId = projectId;
        this.#now = now;
        this.#firstDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - (HISTORY_DAYS - 1) * DAY_MS);
    }

    *days(): Generator<DemoDay>{
        const visitors = new VisitorRoster(this.#random, this.#firstDay).build();
        const visits = Array.from({ length: HISTORY_DAYS }, () => new Array<[Visitor, number]>());
        for(const visitor of visitors){
            visitor.visits.forEach((day, ordinal) => visits[day].push([visitor, ordinal]));
        }

        for(let day = 0; day < HISTORY_DAYS; day++){
            const jobs = visits[day]
                .map(([visitor, ordinal]) => this.#job(this.#visit(visitor, day, ordinal)))
                .filter((job) => job.receivedAt <= this.#now - SETTLED_MS);

            yield {
                day,
                startsAt: new Date(this.#firstDay.getTime() + day * DAY_MS),
                jobs
            };
        }
    }

    #visit(visitor: Visitor, day: number, ordinal: number): Visit{
        const localMidnight = this.#firstDay.getTime() + day * DAY_MS - visitor.city.utcOffset * HOUR_MS;
        const seconds = this.#random.weighted(HOURS) * SECONDS_PER_HOUR + this.#random.int(0, SECONDS_PER_HOUR - 1);

        return {
            visitor,
            sessionId: this.#random.uuid(),
            day,
            ordinal,
            startedAt: localMidnight + seconds * MS_PER_SECOND,
            release: RELEASES.filter(([from]) => from <= day).at(-1)?.[1] ?? RELEASES[0][1],
            attribution: this.#attribution(visitor, ordinal)
        };
    }

    #attribution(visitor: Visitor, ordinal: number): Attribution{
        if(ordinal === 0 && visitor.campaign) return CAMPAIGN;
        if(ordinal > 0 && this.#random.chance(RETURNING_DIRECT_CHANCE)) return DIRECT;

        return this.#random.weighted(ATTRIBUTIONS);
    }

    #job(visit: Visit): IngestBatchJob{
        const events = this.#journey.walk(visit);
        const { identity, identifiesOn } = visit.visitor;

        return {
            projectId: this.#projectId,
            receivedAt: Math.max(...events.map((event) => event.timestamp)) + DELIVERY_DELAY_MS,
            anonymousId: visit.visitor.anonymousId,
            userId: identity !== null && visit.ordinal > identifiesOn ? identity.userId : null,
            sessionId: visit.sessionId,
            sdk: SDK,
            context: this.#context(visit),
            events
        };
    }

    #context(visit: Visit): EnrichedContext{
        const { city, device } = visit.visitor;
        const slow = device.device !== 'desktop' && this.#random.chance(SLOW_CONNECTION_CHANCE);

        return {
            country: city.country,
            region: city.region,
            city: city.city,
            os: device.os,
            osVersion: device.osVersion === '' ? null : device.osVersion,
            browser: device.browser,
            browserVersion: device.browserVersion,
            device: device.device,
            language: city.language,
            timezone: city.timezone,
            screenWidth: device.screenWidth,
            screenHeight: device.screenHeight,
            viewportWidth: device.viewportWidth,
            connection: slow ? '3g' : '4g',
            release: visit.release
        };
    }
}
