export interface StoredObject{
    key: string;
    size: number;
    modifiedAt: Date;
}

export interface StoredPage{
    objects: StoredObject[];
    folders: string[];
    cursor: string | null;
}

export interface StoredStat{
    size: number;
    modifiedAt: Date;
    contentType: string | null;
    cacheControl: string | null;
    etag: string | null;
}

export interface ListOptions{
    grouped: boolean;
    limit: number;
    cursor?: string;
}