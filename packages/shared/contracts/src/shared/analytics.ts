export type Device = 'desktop' | 'mobile' | 'tablet';

export type Channel = 'direct' | 'organic' | 'paid' | 'social' | 'messaging' | 'email' | 'ai' | 'referral';

export type EventType = 'pageview' | 'pageleave' | 'click' | 'custom' | 'error' | 'vital' | 'identify';

export type VitalName = 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';

export type VitalRating = 'good' | 'needs-improvement' | 'poor';

export type TraitValue = string | number | boolean | null;

export type Traits = Record<string, TraitValue>;

export interface Slice{
    id: string;
    label: string;
    value: number;
    secondary?: number;
    detail?: string;
}
