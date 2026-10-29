export type Request<A extends readonly unknown[], O> = (...args: A) => PromiseLike<O>;

export type PendingArgs<A extends readonly unknown[]> = { [K in keyof A]: A[K] | undefined };

export interface Query<T>{
    data: T | null;
    loading: boolean;
    error: Error | undefined;
    reload: () => void;
}

export interface QueryOptions<O, T>{
    select?: (data: O) => T;
    enabled?: boolean;
    dependsOn?: Query<unknown> | Query<unknown>[];
}

export interface UploadProgress{
    loaded: number;
    total: number;
}

export interface FilesUpload{
    current: number;
    total: number;
    share: number;
}

export interface UploadOptions{
    path?: PathValues;
    body: FormData;
    onProgress: (progress: UploadProgress) => void;
}

export interface MutationOptions<O>{
    onSuccess?: (data: O) => void;
}

export interface Mutation<A extends readonly unknown[], O>{
    run: (...args: A) => Promise<O>;
    loading: boolean;
    error: Error | undefined;
}

export interface ConfirmedMutationOptions<O>{
    onDone?: (data: O) => void;
    closeOnDone?: boolean;
}

export interface ConfirmedMutation<A extends readonly unknown[]>{
    isOpen: boolean;
    open: () => void;
    close: () => void;
    onOpenChange: (isOpen: boolean) => void;
    isPending: boolean;
    error: string | null;
    confirm: (...args: A) => void;
}

export type PathValues = Record<string, string | number>;

export interface CallOptions<I>{
    path?: PathValues;
    query?: object;
    body?: I | FormData;
    fresh?: boolean;
    keepalive?: boolean;
}

export interface QuerySnapshot<O>{
    args: string;
    attempt: number;
    data: O | null;
    error: Error | undefined;
}
