export interface NormalizedPath{
    path: string;
    rawPath: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIGITS_PATTERN = /^\d+$/;
const TOKEN_PATTERN = /^[0-9a-z]{8,}$/i;
const DIGIT_PATTERN = /\d/;
const QUERY_PATTERN = /[?#]/;
const WILDCARD = '*';
const PARAM_PREFIX = ':';
const ID_SEGMENT = ':id';

const withoutQuery = (path: string): string => {
    const end = path.search(QUERY_PATTERN);
    const bare = end === -1 ? path : path.slice(0, end);
    return bare === '' ? '/' : bare;
};

const segmentsOf = (path: string): string[] => path.split('/').filter((segment) => segment !== '');

const joined = (segments: string[]): string => `/${segments.join('/')}`;

const isIdLike = (segment: string): boolean =>
    UUID_PATTERN.test(segment)
    || DIGITS_PATTERN.test(segment)
    || (TOKEN_PATTERN.test(segment) && DIGIT_PATTERN.test(segment));

const matches = (pattern: string[], segments: string[]): boolean => {
    const wildcard = pattern.at(-1) === WILDCARD;
    const fixed = wildcard ? pattern.slice(0, -1) : pattern;
    if(wildcard ? segments.length < fixed.length : segments.length !== fixed.length) return false;

    return fixed.every((part, index) => part.startsWith(PARAM_PREFIX) || part === segments[index]);
};

export const normalizePath = (path: string, routeGroups: string[]): NormalizedPath => {
    const rawPath = withoutQuery(path);
    const segments = segmentsOf(rawPath);
    const group = routeGroups.map(segmentsOf).find((pattern) => matches(pattern, segments));

    return {
        path: joined(group ?? segments.map((segment) => isIdLike(segment) ? ID_SEGMENT : segment)),
        rawPath
    };
};
