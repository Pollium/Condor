import { BatchIngestedPayload } from '../domain/events';

declare global{
    interface EventMap{
        'tracking.batch.ingested': BatchIngestedPayload;
    }
}
