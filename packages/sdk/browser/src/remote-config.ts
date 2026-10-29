import { RemoteConfig } from '@condor/contracts/ingest/config';

export type ConfigResult = { kind: 'ok'; config: RemoteConfig } | { kind: 'unknown-key' } | { kind: 'unreachable' };

export const fetchRemoteConfig = async (host: string, key: string): Promise<ConfigResult> => {
    try{
        const response = await fetch(`${host}/i/config?key=${encodeURIComponent(key)}`, { credentials: 'omit' });
        if(response.status === 401) return { kind: 'unknown-key' };
        if(!response.ok) return { kind: 'unreachable' };
        const body = await response.json() as { data: RemoteConfig };
        return { kind: 'ok', config: body.data };
    }catch{
        return { kind: 'unreachable' };
    }
};
