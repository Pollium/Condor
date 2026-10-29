const LIKE_WILDCARDS = /[\\%_]/g;

export const containsPattern = (term: string): string => `%${term.replace(LIKE_WILDCARDS, '\\$&')}%`;
