import Random from './Random';
import { CITIES, DEVICES, FIRST_NAMES, HISTORY_DAYS, LAST_NAMES, WEEKDAY_WEIGHTS } from './store';
import { DemoIdentity, Visitor, Weighted } from './types';

const VISITORS = 3000;
const CAMPAIGN_VISITORS = 240;
const CAMPAIGN_FIRST_DAY = 70;
const CAMPAIGN_LAST_DAY = 73;
const IDENTIFIED_SHARE = 0.35;
const RETURN_CHANCE = 0.5;
const LOYAL_RETURN_CHANCE = 0.68;
const MAX_VISITS = 14;
const MEAN_GAP_DAYS = 7;
const GROWTH = 0.6;
const WEEKDAYS = 7;
const BUSIEST_WEEKDAY = Math.max(...WEEKDAY_WEIGHTS);
const ANONYMOUS_ID_LENGTH = 16;
const USER_ID_LENGTH = 10;
const EMAIL_SUFFIX_MAX = 99;
const DIACRITICS = /[̀-ͯ]/g;

export default class VisitorRoster{
    #random: Random;
    #firstWeekday: number;
    #dayWeights: Weighted<number>[];

    constructor(random: Random, firstDay: Date){
        this.#random = random;
        this.#firstWeekday = firstDay.getUTCDay();
        this.#dayWeights = Array.from({ length: HISTORY_DAYS }, (_, day) => {
            return {
                value: day,
                weight: (1 + GROWTH * day / (HISTORY_DAYS - 1)) * WEEKDAY_WEIGHTS[this.#weekday(day)]
            };
        });
    }

    build(): Visitor[]{
        return [
            ...Array.from({ length: VISITORS }, () => this.#visitor(false)),
            ...Array.from({ length: CAMPAIGN_VISITORS }, () => this.#visitor(true))
        ];
    }

    #visitor(campaign: boolean): Visitor{
        const identity = this.#random.chance(IDENTIFIED_SHARE) ? this.#identity() : null;
        const first = campaign ? this.#random.int(CAMPAIGN_FIRST_DAY, CAMPAIGN_LAST_DAY) : this.#random.weighted(this.#dayWeights);
        const visits = this.#schedule(first, identity !== null);

        return {
            anonymousId: `anon_${this.#random.hex(ANONYMOUS_ID_LENGTH)}`,
            city: this.#random.weighted(CITIES),
            device: this.#random.weighted(DEVICES),
            identity,
            identifiesOn: this.#random.int(0, Math.min(1, visits.length - 1)),
            campaign,
            visits
        };
    }

    #schedule(first: number, loyal: boolean): number[]{
        const visits = [first];
        const returnChance = loyal ? LOYAL_RETURN_CHANCE : RETURN_CHANCE;

        while(visits.length < MAX_VISITS && this.#random.chance(returnChance)){
            let next = visits[visits.length - 1] + Math.round(-Math.log(1 - this.#random.next()) * MEAN_GAP_DAYS);
            while(!this.#random.chance(WEEKDAY_WEIGHTS[this.#weekday(next)] / BUSIEST_WEEKDAY)){
                next++;
            }
            if(next >= HISTORY_DAYS) break;
            visits.push(next);
        }

        return visits;
    }

    #identity(): DemoIdentity{
        const first = this.#random.pick(FIRST_NAMES);
        const last = this.#random.pick(LAST_NAMES);
        const handle = `${first}.${last}${this.#random.int(1, EMAIL_SUFFIX_MAX)}`.normalize('NFD').replace(DIACRITICS, '').toLowerCase();

        return {
            userId: `cus_${this.#random.hex(USER_ID_LENGTH)}`,
            name: `${first} ${last}`,
            email: `${handle}@example.com`
        };
    }

    #weekday(day: number): number{
        return (this.#firstWeekday + day) % WEEKDAYS;
    }
}
