import { createParamDecorator } from '@readable/decorators/controllers/Params';
import { parseId } from '@readable/utils/controllers/parse-id';
import { SessionSignal, SessionSort } from '@condor/contracts/sessions/domain';
import { Device } from '@condor/contracts/shared/analytics';
import { PERIODS } from '@condor/contracts/shared/period';
import { parseChoice, parseText } from '@/shared/http/query-params';
import { SessionFilter } from '../contracts/domain/filters';

const DEVICES: readonly Device[] = ['desktop', 'mobile', 'tablet'];
const SIGNALS: readonly SessionSignal[] = ['rage', 'dead', 'error', 'uturn'];
const SORTS: readonly SessionSort[] = ['recent', 'longest', 'events', 'frustrated'];
const FLAGS = ['true', 'false'] as const;

const parseFlag = (field: string, raw: unknown): boolean | null => {
    const flag = parseChoice(field, raw, FLAGS, null);
    if(flag === null) return null;

    return flag === 'true';
};

const parseFilter = (query: Record<string, unknown>): SessionFilter => {
    const personId = parseText('personId', query.personId);

    return {
        period: parseChoice('period', query.period, PERIODS, null),
        search: parseText('search', query.search)?.trim() || null,
        device: parseChoice('device', query.device, DEVICES, null),
        country: parseText('country', query.country),
        signal: parseChoice('signal', query.signal, SIGNALS, null),
        converted: parseFlag('converted', query.converted),
        identified: parseFlag('identified', query.identified),
        replay: parseFlag('replay', query.replay),
        personId: personId === null ? null : parseId(personId),
        sort: parseChoice('sort', query.sort, SORTS, 'recent')
    };
};

export const SessionFilters = (): ParameterDecorator => createParamDecorator((req) => parseFilter(req.query as Record<string, unknown>));
