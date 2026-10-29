import { WireUtm } from '@condor/contracts/ingest/wire';

const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'] as const;

export const currentPath = (): string => {
    const { pathname, hash } = window.location;
    return hash.startsWith('#/') ? `${pathname}${hash.split('?')[0]}` : pathname;
};

export const utmOf = (search: string): WireUtm | undefined => {
    const params = new URLSearchParams(search);
    const utm: WireUtm = {};
    for(const key of UTM_KEYS){
        const value = params.get(`utm_${key}`);
        if(value) utm[key] = value.slice(0, 128);
    }
    return Object.keys(utm).length === 0 ? undefined : utm;
};
