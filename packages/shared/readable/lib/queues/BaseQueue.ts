import { redisOptions } from '../redis/RedisClient';
import { logger } from '../utils/Logger';
import { Queue, Worker, Job, RateLimiterOptions, JobsOptions, RepeatOptions } from 'bullmq';

const WORKER_STAGES = ['active', 'completed', 'failed'] as const;

export default abstract class BaseQueue<T>{
    abstract readonly name: string;
    protected readonly concurrency: number = 1;
    protected readonly limiter: RateLimiterOptions | undefined = undefined;
    protected readonly lockDuration: number = 30_000;
    protected readonly everyMs: number | undefined = undefined;

    protected readonly jobOptions: JobsOptions = {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
    };

    #queue?: Queue;
    #worker?: Worker;

    async add(data: T, options: JobsOptions = {}){
        const job = await this.#connect().add(this.name, data, {
            ...this.jobOptions,
            ...options
        });
        
        this.#trace('enqueue', job);
    }

    abstract process(data: T): Promise<void>;

    protected async schedule(repeat: Partial<RepeatOptions>, data?: T){
        await this.#connect().upsertJobScheduler(this.name, repeat, {
            name: this.name,
            data
        });

        this.#trace('schedule');
    } 

    startWorker(): Worker{
        this.#worker ??= this.#traced(new Worker(this.name, (job) => this.process(job.data), {
            connection: redisOptions(),
            concurrency: this.concurrency,
            limiter: this.limiter,
            lockDuration: this.lockDuration
        }));

        if(this.everyMs !== undefined){
            this.schedule({ every: this.everyMs });
        }

        return this.#worker;
    }

    async close(){
        await this.#worker?.close();
        await this.#queue?.close();
    }

    #connect(): Queue{
        this.#queue ??= new Queue(this.name, { connection: redisOptions() });

        return this.#queue;
    }

    #traced(worker: Worker): Worker{
        for(const stage of WORKER_STAGES){
            worker.on(stage, (job?: Job) => this.#trace(stage, job));
        }

        return worker;
    }

    #trace(stage: string, job?: Job){
        logger.debug(this.name, {
            scope: `queue.${stage}`,
            jobId: job?.id,
            attempts: job?.attemptsMade
        });
    }
}
