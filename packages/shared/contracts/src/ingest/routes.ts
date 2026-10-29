import { get, post } from '../shared/routing';
import { RemoteConfig } from './config';
import { IngestReceipt, WireBatch, WireReplayChunk } from './wire';

export const ingestRoutes = {
    config: get<RemoteConfig>('/i/config'),
    batch: post<WireBatch, IngestReceipt>('/i/batch'),
    replay: post<WireReplayChunk, IngestReceipt>('/i/replay'),
    script: get<string>('/i/condor.js')
};
