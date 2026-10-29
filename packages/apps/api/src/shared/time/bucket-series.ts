export const BUCKET_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS';

export interface BucketRow{
    bucket: string;
}

export const seriesOf = <R extends BucketRow>(buckets: string[], rows: R[], value: (row: R) => number): number[] => {
    const byBucket = new Map(rows.map((row) => [row.bucket, value(row)]));
    return buckets.map((bucket) => byBucket.get(bucket) ?? 0);
};
