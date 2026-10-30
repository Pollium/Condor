import { Device } from '@condor/contracts/shared/analytics';
import { SessionSignal, SessionSort } from '@condor/contracts/sessions/domain';
import { Period } from '@condor/contracts/shared/period';
import { Segment } from '@condor/contracts/shared/segment';

export interface SessionFilter{
    period: Period | null;
    search: string | null;
    device: Device | null;
    country: string | null;
    signal: SessionSignal | null;
    converted: boolean | null;
    identified: boolean | null;
    replay: boolean | null;
    personId: string | null;
    segment: Segment | null;
    sort: SessionSort;
}
