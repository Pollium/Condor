import { Mutation, MutationOptions, Request } from '../../contracts/api';
import { toError } from '../../utils/format/errors';
import { useState } from 'react';

export const useMutation = <A extends readonly unknown[], O>(
    request: Request<A, O>,
    { onSuccess }: MutationOptions<O> = {}
): Mutation<A, O> => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>(undefined);

    const run = async (...args: A): Promise<O> => {
        setLoading(true);
        setError(undefined);

        try{
            const data = await request(...args);
            onSuccess?.(data);
            return data;
        }catch(cause){
            setError(toError(cause));
            throw cause;
        }finally{
            setLoading(false);
        }
    };

    return {
        run,
        loading,
        error
    };
};
