import Identity from '../src/identity';
import Recorder from '../src/recorder';
import Transport from '../src/transport';
import { RemoteRecording } from '@condor/contracts/ingest/config';
import { record } from '@rrweb/record';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@rrweb/record', () => ({ record: vi.fn(() => () => undefined) }));

const SETTINGS: RemoteRecording = {
    enabled: true,
    sampleRate: 1,
    maskInputs: true,
    maskText: false,
    blockSelector: '.card-number',
    captureConsole: false,
    captureNetwork: false
};

const optionsOf = (settings: RemoteRecording) => {
    const identity = { sample: () => true } as unknown as Identity;
    const recorder = new Recorder({ key: 'ck_test', endpoint: 'https://condor.example.com' }, identity, {} as Transport, () => undefined);
    recorder.start(settings);
    recorder.stop();
    return vi.mocked(record).mock.lastCall![0]!;
};

describe('Recorder', () => {
    it('masks the text of elements marked data-condor-mask and blocks the configured selectors', () => {
        expect(optionsOf(SETTINGS)).toMatchObject({
            maskAllInputs: true,
            maskTextSelector: '[data-condor-mask]',
            blockSelector: '[data-condor-block], .card-number'
        });
    });

    it('masks every text when the app asks for it', () => {
        expect(optionsOf({ ...SETTINGS, maskText: true })).toMatchObject({ maskTextSelector: '*' });
    });
});
