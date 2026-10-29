import ValidationError from '@readable/errors/Validation';

export interface IntegerRange<F extends number | null = number>{
    min: number;
    max: number;
    fallback: F;
}

const isMissing = (raw: unknown): boolean => raw === undefined || raw === '';

export const parseChoice = <T extends string, F extends T | null>(
    field: string,
    raw: unknown,
    choices: readonly T[],
    fallback: F
): T | F => {
    if(isMissing(raw)) return fallback;
    if(typeof raw === 'string' && (choices as readonly string[]).includes(raw)) return raw as T;
    throw new ValidationError({ [field]: `Invalid ${field}` });
};

export const requireChoice = <T extends string>(field: string, raw: unknown, choices: readonly T[]): T => {
    const value = parseChoice(field, raw, choices, null);
    if(value === null) throw new ValidationError({ [field]: `Missing ${field}` });
    return value;
};

export const parseInteger = <F extends number | null>(field: string, raw: unknown, range: IntegerRange<F>): number | F => {
    if(isMissing(raw)) return range.fallback;

    const value = Number(raw);
    if(!Number.isInteger(value) || value < range.min || value > range.max){
        throw new ValidationError({ [field]: `Invalid ${field}` });
    }
    return value;
};

export const parseText = (field: string, raw: unknown): string | null => {
    if(isMissing(raw)) return null;
    if(typeof raw === 'string') return raw;
    throw new ValidationError({ [field]: `Invalid ${field}` });
};

export const requireText = (field: string, raw: unknown): string => {
    const value = parseText(field, raw);
    if(value === null) throw new ValidationError({ [field]: `Missing ${field}` });
    return value;
};
