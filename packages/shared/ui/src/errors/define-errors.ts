import { ErrorTable } from '@condor/contracts/shared/errors';
import { ClientErrorFactory } from '../contracts/errors';
import { ClientError } from './ClientError';

export const defineErrors = <T extends ErrorTable>({ domain, causes }: T): Record<keyof T['causes'], ClientErrorFactory> => {
    const factories = {} as Record<keyof T['causes'], ClientErrorFactory>;
    for(const cause of Object.keys(causes)){
        factories[cause as keyof T['causes']] = (detail?: string) =>
            new ClientError(detail === undefined ? `${domain}::${cause}` : `${domain}::${cause}:${detail}`);
    }
    return factories;
};
