import BatchIngestionService from '../services/BatchIngestion';
import BaseQueue from '@readable/queues/BaseQueue';
import { IngestBatchJob, ingestQueues } from '@/modules/tracking/contracts/domain/queue';
import { config } from '@/shared/config';

export default class IngestBatchQueue extends BaseQueue<IngestBatchJob>{
    readonly name = ingestQueues.batch;

    protected readonly concurrency = config.ingestConcurrency;

    #ingestion = new BatchIngestionService();

    process(job: IngestBatchJob){
        return this.#ingestion.ingest(job);
    }
}
