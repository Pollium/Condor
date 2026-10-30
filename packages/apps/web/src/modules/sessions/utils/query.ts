import { Device } from '@condor/contracts/shared/analytics';
import { Period } from '@condor/contracts/shared/period';
import { SessionListQuery, SessionSignal, SessionSort } from '@condor/contracts/sessions/domain';
import { copy } from '@/modules/sessions/i18n';
import type { Choice } from '@/shared/components/Segmented';

export const PAGE_SIZES = [25, 50, 100];

export interface Flag{
    id: string;
    label: string;
}

export const FLAGS: Flag[] = [
    { id: 'error', label: copy.flags.error },
    { id: 'rage', label: copy.flags.rage },
    { id: 'dead', label: copy.flags.dead },
    { id: 'uturn', label: copy.flags.uturn },
    { id: 'converted', label: copy.flags.converted },
    { id: 'identified', label: copy.flags.identified },
    { id: 'replay', label: copy.flags.replay }
];

const SIGNALS: string[] = ['error', 'rage', 'dead', 'uturn'];

export const SORTS: Choice<SessionSort>[] = [
    { value: 'recent', label: copy.sorts.recent },
    { value: 'longest', label: copy.sorts.longest },
    { value: 'events', label: copy.sorts.events },
    { value: 'frustrated', label: copy.sorts.frustrated }
];

export const DEVICES: Choice<Device | 'all'>[] = [
    { value: 'all', label: copy.allDevices },
    { value: 'desktop', label: copy.devices.desktop },
    { value: 'mobile', label: copy.devices.mobile },
    { value: 'tablet', label: copy.devices.tablet }
];

export interface ListState{
    search: string;
    sort: SessionSort;
    device: Device | null;
    country: string | null;
    personId: string | null;
    flags: string[];
    page: number;
    pageSize: number;
}

const pick = <T extends string>(value: string | null, choices: Choice<T>[]): T | null =>
    choices.find((choice) => choice.value === value)?.value ?? null;

export const readState = (params: URLSearchParams): ListState => {
    const flags = params.getAll('filtro').filter((flag) => FLAGS.some((entry) => entry.id === flag));
    const size = Number(params.get('tamano'));
    return {
        search: params.get('q') ?? '',
        sort: pick(params.get('orden'), SORTS) ?? 'recent',
        device: pick(params.get('dispositivo'), DEVICES.slice(1)) as Device | null,
        country: params.get('pais'),
        personId: params.get('persona'),
        flags: flags.filter((flag) => !SIGNALS.includes(flag)).concat(flags.filter((flag) => SIGNALS.includes(flag)).slice(-1)),
        page: Math.max(1, Math.floor(Number(params.get('pagina'))) || 1),
        pageSize: PAGE_SIZES.includes(size) ? size : PAGE_SIZES[0]
    };
};

export const writeState = (state: ListState): URLSearchParams => {
    const params = new URLSearchParams();
    if(state.search) params.set('q', state.search);
    if(state.sort !== 'recent') params.set('orden', state.sort);
    if(state.device) params.set('dispositivo', state.device);
    if(state.country) params.set('pais', state.country);
    if(state.personId) params.set('persona', state.personId);
    state.flags.forEach((flag) => params.append('filtro', flag));
    if(state.page > 1) params.set('pagina', String(state.page));
    if(state.pageSize !== PAGE_SIZES[0]) params.set('tamano', String(state.pageSize));
    return params;
};

export const narrowFlags = (selected: string[], previous: string[]): string[] => {
    const added = selected.find((flag) => !previous.includes(flag) && SIGNALS.includes(flag));
    return added ? selected.filter((flag) => !SIGNALS.includes(flag) || flag === added) : selected;
};

export const toQuery = (state: ListState, period: Period): SessionListQuery => {
    const has = (flag: string) => state.flags.includes(flag);
    return {
        period,
        search: state.search.trim() || undefined,
        sort: state.sort,
        device: state.device ?? undefined,
        country: state.country ?? undefined,
        personId: state.personId ?? undefined,
        signal: state.flags.find((flag) => SIGNALS.includes(flag)) as SessionSignal | undefined,
        converted: has('converted') ? 'true' : undefined,
        identified: has('identified') ? 'true' : undefined,
        replay: has('replay') ? 'true' : undefined,
        limit: state.pageSize,
        offset: (state.page - 1) * state.pageSize
    };
};

export const isNarrowed = (state: ListState): boolean =>
    Boolean(state.search.trim() || state.device || state.country || state.personId || state.flags.length);
