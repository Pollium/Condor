import ValidationError from '@readable/errors/Validation';
import { Segment } from '@condor/contracts/shared/segment';
import { parseText } from './query-params';

const MAX_KEY = 64;
const MAX_VALUE = 256;

export const parseSegment = (rawKey: unknown, rawValue: unknown): Segment | null => {
    const key = parseText('traitKey', rawKey);
    const value = parseText('traitValue', rawValue);
    if(key === null && value === null) return null;
    if(key === null || value === null || key.length > MAX_KEY || value.length > MAX_VALUE){
        throw new ValidationError({ traitKey: 'Invalid segment' });
    }

    return { key, value };
};
