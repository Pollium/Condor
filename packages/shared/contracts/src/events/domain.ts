import { Period } from '../shared/period';

export interface EventSummary{
    name: string;
    count: number;
    previousCount: number;
    people: number;
    lastSeenAt: string;
}

export interface EventBucket{
    label: string;
    count: number;
}

export interface EventProperty{
    key: string;
    count: number;
}

export interface EventDetail{
    name: string;
    period: Period;
    count: number;
    previousCount: number;
    people: number;
    series: EventBucket[];
    properties: EventProperty[];
}

export interface PropertyValue{
    value: string;
    count: number;
    people: number;
}

export interface PropertyBreakdown{
    key: string;
    total: number;
    values: PropertyValue[];
}

export interface TraitValueCount{
    value: string;
    people: number;
}

export interface TraitSummary{
    key: string;
    people: number;
    values: TraitValueCount[];
}
