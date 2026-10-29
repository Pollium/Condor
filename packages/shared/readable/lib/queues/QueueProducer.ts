import { redisOptions } from '../redis/RedisClient';
import { JobsOptions, Queue } from 'bullmq';

export default class QueueProducer<T>{
    #queue?: Queue;

    constructor(private readonly name: string, private readonly jobOptions: JobsOptions = {}){}

    async add(data: T, options: JobsOptions = {}){
        this.#queue ??= new Queue(this.name, { connection: redisOptions() });
        await this.#queue.add(this.name, data, { ...this.jobOptions, ...options });
    }

    async close(){
        await this.#queue?.close();
    }
}
