import RetentionSweeperService from '../services/RetentionSweeper';
import BaseQueue from '@readable/queues/BaseQueue';
import { JobsOptions } from 'bullmq';

const DAY_MS = 86_400_000;

export default class RetentionQueue extends BaseQueue<void>{
    readonly name = 'analytics-retention';

    protected readonly concurrency = 1;

    protected readonly everyMs = DAY_MS;

    protected override readonly jobOptions: JobsOptions = {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: true
    };

    #sweeper = new RetentionSweeperService();

    process(){
        return this.#sweeper.run();
    }
}
