const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;
const MINUTES_PER_HOUR = 60;
const SUNDAY = 0;
const ISO_SUNDAY = 7;

export const utcDayStart = (daysAgo: number): Date => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - daysAgo * DAY_MS);
};

export const utcAt = (daysAgo: number, hours: number, minutes = 0): Date =>
    new Date(utcDayStart(daysAgo).getTime() + (hours * MINUTES_PER_HOUR + minutes) * MINUTE_MS);

export const dayLabel = (date: Date): string => `${date.toISOString().slice(0, 10)}T00:00:00`;

export const isoWeekday = (date: Date): number => {
    const day = date.getUTCDay();
    return day === SUNDAY ? ISO_SUNDAY : day;
};
