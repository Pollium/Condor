import { ConfigError } from './errors/ConfigError';

export interface ReadableRedisConfig{
    host: string;
    port: number;
}

export interface ReadableStorageConfig{
    endpoint: string;
    region: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
    publicUrl: string;
}

export interface ReadableQueueConfig{
    concurrency: number;
}

export interface ReadableDatabaseConfig{
    url: string;
    schema: string | undefined;
    synchronize: boolean;
}

export interface ReadableConfig{
    jwtSecret: string | null;
    redis: ReadableRedisConfig;
    storage: ReadableStorageConfig | null;
    queue: ReadableQueueConfig;
}

let current: ReadableConfig | undefined;

export const configure = (next: ReadableConfig) => {
    current = next;
};

export const readableConfig = (): ReadableConfig => {
    if(!current) throw ConfigError.MissingEnv('readable');
    return current;
};

export const jwtSecret = (): string => {
    const secret = readableConfig().jwtSecret;
    if(secret === null) throw ConfigError.MissingEnv('JWT_SECRET');
    return secret;
};

export const storageConfig = (): ReadableStorageConfig => {
    const storage = readableConfig().storage;
    if(storage === null) throw ConfigError.MissingEnv('STORAGE');
    return storage;
};
