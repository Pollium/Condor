import ReplayIndexerService from '../services/ReplayIndexer';
import BaseQueue from '@readable/queues/BaseQueue';
import { IngestReplayJob, ingestQueues } from '@/modules/tracking/contracts/domain/queue';
import { config } from '@/shared/config';

export default class IngestReplayQueue extends BaseQueue<IngestReplayJob>{
    readonly name = ingestQueues.replay;

    protected readonly concurrency = config.ingestConcurrency;

    #indexer = new ReplayIndexerService();

    process(job: IngestReplayJob){
        return this.#indexer.index(job);
    }
}
