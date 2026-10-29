import { storageConfig } from '../config';
import { ListOptions, StoredPage, StoredStat } from '../contracts/storage';
import { CreateBucketCommand, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, HeadObjectCommand, ListObjectsV2Command, PutBucketCorsCommand, PutBucketPolicyCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

class ObjectStorage{
    #ensured?: Promise<void>;
    #client?: S3Client;

    #s3(){
        this.#client ??= new S3Client({
            endpoint: storageConfig().endpoint,
            region: storageConfig().region,
            forcePathStyle: true,
            credentials: {
                accessKeyId: storageConfig().accessKey,
                secretAccessKey: storageConfig().secretKey
            }
        });
        return this.#client;
    }

    put(
        key: string,
        body: string | Uint8Array,
        contentType: string
    ){
        return this.#write(key, body, contentType);
    }

    putImmutable(
        key: string,
        body: string | Uint8Array,
        contentType: string
    ){
        return this.#write(key, body, contentType, IMMUTABLE_CACHE_CONTROL);
    }

    putDownload(
        key: string,
        body: string | Uint8Array,
        contentType: string,
        filename: string
    ){
        return this.#write(key, body, contentType, IMMUTABLE_CACHE_CONTROL, `attachment; filename="${filename.replace(/["\\]/g, '')}"`);
    }

    async get(key: string): Promise<Buffer>{
        await this.#ensureBucket();
        const found = await this.#s3().send(new GetObjectCommand({
            Bucket: storageConfig().bucket,
            Key: key
        }));

        return Buffer.from(await found.Body!.transformToByteArray());
    }

    async list(prefix: string, options: ListOptions): Promise<StoredPage>{
        await this.#ensureBucket();
        const page = await this.#s3().send(new ListObjectsV2Command({
            Bucket: storageConfig().bucket,
            Prefix: prefix === '' ? undefined : prefix,
            Delimiter: options.grouped ? '/' : undefined,
            MaxKeys: options.limit,
            ContinuationToken: options.cursor
        }));

        const objects = (page.Contents ?? []).map((object) => ({
            key: object.Key!,
            size: object.Size!,
            modifiedAt: object.LastModified!
        }));

        const folders = (page.CommonPrefixes ?? []).map((common) => common.Prefix!);

        return {
            objects,
            folders,
            cursor: page.NextContinuationToken ?? null
        };
    }

    async stat(key: string): Promise<StoredStat | null>{
        await this.#ensureBucket();

        try{
            const head = await this.#s3().send(new HeadObjectCommand({
                Bucket: storageConfig().bucket,
                Key: key
            }));

            return {
                size: head.ContentLength ?? 0,
                modifiedAt: head.LastModified!,
                contentType: head.ContentType ?? null,
                cacheControl: head.CacheControl ?? null,
                etag: head.ETag ?? null
            };
        }catch{
            return null;
        }
    }

    async exists(key: string): Promise<boolean>{
        await this.#ensureBucket();

        try{
            await this.#s3().send(new HeadObjectCommand({
                Bucket: storageConfig().bucket,
                Key: key
            }));

            return true;
        }catch{
            return false;
        }
    }

    async delete(key: string){
        await this.#ensureBucket();
        await this.#s3().send(new DeleteObjectCommand({
            Bucket: storageConfig().bucket,
            Key: key
        }));
    }

    publicUrl(key: string): string{
        return `${storageConfig().publicUrl}/${storageConfig().bucket}/${key}`;
    }

     async #write(
        key: string,
        body: string | Uint8Array,
        contentType: string,
        cacheControl?: string,
        contentDisposition?: string
    ){
        await this.#ensureBucket();
        await this.#s3().send(new PutObjectCommand({
            Bucket: storageConfig().bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
            CacheControl: cacheControl,
            ContentDisposition: contentDisposition
        }));
    }

    #ensureBucket(){
        this.#ensured ??= this.#headOrCreate().catch((error) => {
            this.#ensured = undefined;
            throw error;
        });
        return this.#ensured;
    }

    async #headOrCreate(){
        try{
            await this.#s3().send(new HeadBucketCommand({ Bucket: storageConfig().bucket}));
        }catch{
            await this.#s3().send(new CreateBucketCommand({ Bucket: storageConfig().bucket }));
            await this.#setPublicReadPolicy();
        }

        await this.#allowBrowserReads();
    }

    async #allowBrowserReads(){
        await this.#s3().send(new PutBucketCorsCommand({
            Bucket: storageConfig().bucket,
            CORSConfiguration: {
                CORSRules: [{
                    AllowedMethods: ['GET', 'HEAD'],
                    AllowedOrigins: ['*'],
                    AllowedHeaders: ['*'],
                    ExposeHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges'],
                    MaxAgeSeconds: 3600
                }]
            }
        }));
    }

    async #setPublicReadPolicy(){
        const policy = {
            Version: '2012-10-17',
            Statement: [{
                Sid: 'PublicRead',
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${storageConfig().bucket}/*`]
            }]
        };
        await this.#s3().send(new PutBucketPolicyCommand({
            Bucket: storageConfig().bucket,
            Policy: JSON.stringify(policy)
        }));
    }
}

export const objectStorage = new ObjectStorage();
export type { StoredObject, StoredPage, StoredStat, ListOptions } from '../contracts/storage';
