export type Period = '24h' | '7d' | '30d' | '90d';

export const PERIODS: readonly Period[] = ['24h', '7d', '30d', '90d'];

export interface PeriodQuery{
    period?: Period;
}
