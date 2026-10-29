import { PendingArgs, Query, QueryOptions, QuerySnapshot, Request } from '../../contracts/api';
import { toError } from '../../utils/format/errors';
import { Method } from 'alova';
import { useEffect, useRef, useState } from 'react';

const dependenciesOf = (dependsOn: QueryOptions<never, never>['dependsOn']): Query<unknown>[] =>
    dependsOn === undefined ? [] : Array.isArray(dependsOn) ? dependsOn : [dependsOn];

const EMPTY: PendingArgs<[]> = [];

const dispatch = <O>(pending: PromiseLike<O>, force: boolean): PromiseLike<O> =>
    force && pending instanceof Method ? pending.send(true) as Promise<O> : pending;

const selected = <O, T>(data: O, select: ((value: O) => T) | undefined): T =>
    select === undefined ? data as O & T : select(data);

export const useQuery = <A extends readonly unknown[], O, T = O>(
    request: Request<A, O>,
    args: PendingArgs<A> = EMPTY as PendingArgs<A>,
    { select, enabled = true, dependsOn }: QueryOptions<O, T> = {}
): Query<T> => {
    const upstream = dependenciesOf(dependsOn);
    const failed = upstream.find((query) => query.error !== undefined && query.data === null);
    const waiting = upstream.some((query) => query.loading && query.data === null);
    const ready = enabled && !failed && !waiting && args.every((arg) => arg !== undefined);

    const [attempt, setAttempt] = useState(0);
    const [snapshot, setSnapshot] = useState<QuerySnapshot<O> | null>(null);

    const key = ready ? JSON.stringify(args) : null;

    const latest = useRef({ request, args, key });
    const forced = useRef(false);
    const runs = useRef({ issued: 0, landed: 0 });
    useEffect(() => {
        latest.current = { request, args, key };
    });

    useEffect(() => {
        if(key === null) return;

        runs.current.issued += 1;
        const run = runs.current.issued;
        const force = forced.current;
        forced.current = false;

        const load = async () => {
            try{
                const data = await dispatch(latest.current.request(...latest.current.args as A), force);
                if(latest.current.key !== key || run < runs.current.landed) return;

                runs.current.landed = run;
                setSnapshot({ args: key, attempt: run === runs.current.issued ? attempt : -1, data, error: undefined });
            }catch(cause: unknown){
                if(latest.current.key !== key || run !== runs.current.issued) return;

                runs.current.landed = run;
                setSnapshot((previous) => ({
                    args: key,
                    attempt,
                    data: previous?.args === key ? previous.data : null,
                    error: toError(cause)
                }));
            }
        };

        void load();
    }, [key, attempt]);

    const fresh = snapshot?.args === key ? snapshot : null;
    const data = fresh?.data ?? null;

    return {
        loading: waiting || (ready && (fresh === null || fresh.attempt !== attempt)),
        data: data === null ? null : selected(data, select),
        error: failed?.error ?? fresh?.error,
        reload: () => {
            if(failed) return failed.reload();
            forced.current = true;
            setAttempt((value) => value + 1);
        }
    };
};
