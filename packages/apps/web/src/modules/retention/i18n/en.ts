import type es from '@/modules/retention/i18n/es';
import { fmt } from '@/shared/utils/format';

const people = (count: number) => `${fmt.n(count)} ${count === 1 ? 'person' : 'people'}`;

const en: typeof es = {
    people,
    units: {
        day: { short: 'D', one: 'on day', column: 'Day' },
        week: { short: 'W', one: 'in week', column: 'Week of' }
    },
    page: {
        hint: 'People who come back after their first visit',
        grains: {
            day: 'Day',
            week: 'Week'
        },
        anyVisit: 'Any visit',
        returnEvent: 'Counts as a return',
        groupBy: 'Group by',
        failed: 'Could not calculate retention',
        retry: 'Retry',
        loading: 'Grouping people into cohorts…',
        emptyTitle: 'No cohorts yet',
        emptyHint: 'When new people reach your app, you will see here how many come back each day or week.',
        curve: 'Retention curve',
        returning: 'Returning',
        cohorts: {
            day: 'Daily cohorts',
            week: 'Weekly cohorts'
        },
        cohortsHint: {
            day: '% of each cohort that returns that day',
            week: '% of each cohort that returns that week'
        }
    },
    stats: {
        returnIn: (unit: string, index: number) => `Return ${unit} ${index}`,
        stillIn: (unit: string, index: number) => `Still back ${unit} ${index}`,
        notThatFar: 'No cohorts reach that far yet',
        weightedAverage: (count: number) => `Weighted average of ${count} ${count === 1 ? 'cohort' : 'cohorts'}`,
        best: 'Best cohort',
        bestStart: {
            day: (day: string) => `Arrived ${day}`,
            week: (day: string) => `Week of ${day}`
        },
        noneBack: 'No cohort has come back yet'
    },
    grid: {
        people: 'People',
        cell: (returned: number, size: number, unit: string, index: number) => `${fmt.n(returned)} of ${people(size)} ${unit} ${index}`
    }
};

export default en;
