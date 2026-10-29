import { Device } from '@condor/contracts/shared/analytics';
import { SessionSignal, SessionSort } from '@condor/contracts/sessions/domain';
import { Period } from '@condor/contracts/shared/period';

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
    sort: SessionSort;
}
