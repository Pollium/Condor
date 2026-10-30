import { SessionSummary } from '@condor/contracts/sessions/domain';
import { Button, InlineLoading, Pagination } from '@carbon/react';
import { Screen } from '@carbon/icons-react';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SegmentMenu from '@/modules/events/components/SegmentMenu';
import { useSegmentQuery } from '@/modules/events/hooks/use-segment';
import QuickLook from '@/modules/sessions/components/QuickLook';
import SessionList from '@/modules/sessions/components/SessionList';
import SessionToolbar from '@/modules/sessions/components/SessionToolbar';
import { sessionsApi } from '@/modules/sessions/api/api';
import { copy } from '@/modules/sessions/i18n';
import { countryName } from '@/modules/sessions/utils/labels';
import { isNarrowed, PAGE_SIZES, readState, toQuery, writeState, type ListState } from '@/modules/sessions/utils/query';
import { useLive } from '@/modules/live/hooks/use-live';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/Page';
import { copy as shared } from '@/shared/i18n';
import { usePeriodStore } from '@/shared/store/period';
import { errorCopy } from '@/shared/utils/error-copy';
import { viewPath } from '@/shared/utils/views';

const failure = errorCopy();

const SessionsPage = () => {
    const project = useProject();
    const navigate = useNavigate();
    const period = usePeriodStore((store) => store.period);
    const [params, setParams] = useSearchParams();
    const state = useMemo(() => readState(params), [params]);
    const segment = useSegmentQuery(project.id);
    const query = useMemo(() => ({ ...toQuery(state, period), ...segment }), [state, period, segment]);
    const list = useQuery(sessionsApi.list, [project.id, query]);
    const key = JSON.stringify([project.id, query]);
    const [live, setLive] = useState<{ key: string; rows: SessionSummary[] }>({ key, rows: [] });
    const [peek, setPeek] = useState<SessionSummary | null>(null);
    const keyRef = useRef(key);
    const base = viewPath(project.id, 'sesiones');

    useEffect(() => {
        keyRef.current = key;
    }, [key]);

    useLive(project.id, (session) => setLive((current) => {
        const rows = current.key === keyRef.current ? current.rows : [];
        return { key: keyRef.current, rows: [session, ...rows.filter((row) => row.id !== session.id)] };
    }));

    const change = useCallback((next: Partial<ListState>) => {
        setParams(writeState({ ...readState(params), ...next }), { replace: true });
    }, [params, setParams]);

    const sessions = useMemo(() => {
        const items = list.data?.items ?? [];
        const fresh = live.key === key ? live.rows : [];
        const updates = new Map(fresh.map((row) => [row.id, row]));
        const merged = items.map((row) => updates.get(row.id) ?? row);
        if(state.page > 1 || state.sort !== 'recent' || isNarrowed(state)) return merged;
        const known = new Set(items.map((row) => row.id));
        return [...fresh.filter((row) => !known.has(row.id) && row.live), ...merged].slice(0, state.pageSize);
    }, [list.data, live, key, state]);

    const total = list.data?.meta.total ?? null;
    const last = total === null ? null : Math.max(1, Math.ceil(total / state.pageSize));

    useEffect(() => {
        if(last !== null && state.page > last) change({ page: last });
    }, [last, state.page, change]);
    const open = (id: string) => navigate(`${base}/${id}`);
    const scoped = Boolean(state.country || state.personId);

    return (
        <div className='w-full'>
            <PageHeader title={shared.views.sessions}>
                <SessionToolbar state={state} total={total} onChange={change} />
                <SegmentMenu projectId={project.id} />
            </PageHeader>

            {scoped ? (
                <div className='mb-4 flex flex-wrap items-center gap-2 text-[0.8125rem] text-label-2'>
                    <span>{copy.list.only(countryName(state.country), Boolean(state.personId))}</span>
                    <Button kind='ghost' size='sm' onClick={() => change({ country: null, personId: null, page: 1 })}>
                        {copy.list.seeAll}
                    </Button>
                </div>
            ) : null}

            {list.error && !list.data ? (
                <EmptyState icon={Screen} title={copy.list.loadFailed} description={failure(list.error) ?? undefined}>
                    <Button kind='tertiary' size='sm' onClick={list.reload}>
                        {copy.list.retry}
                    </Button>
                </EmptyState>
            ) : !list.data ? (
                <div className='px-4 py-8'>
                    <InlineLoading description={copy.list.loading} />
                </div>
            ) : (
                <div className={list.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                    <SessionList sessions={sessions} narrowed={isNarrowed(state)} onOpen={open} onPeek={setPeek} />
                </div>
            )}

            {total ? (
                <div className='mt-4 flex flex-col gap-3'>
                    <Pagination
                        page={state.page}
                        pageSize={state.pageSize}
                        pageSizes={PAGE_SIZES}
                        totalItems={total}
                        size='sm'
                        backwardText={copy.list.previousPage}
                        forwardText={copy.list.nextPage}
                        itemsPerPageText={copy.list.perPage}
                        pageNumberText={copy.list.page}
                        itemRangeText={copy.list.range}
                        pageRangeText={(_, pages) => copy.list.ofPages(pages)}
                        onChange={({ page, pageSize }) => change({ page: pageSize === state.pageSize ? page : 1, pageSize })}
                    />
                    <p className='text-[0.8125rem] text-label-2'>{copy.list.hint}</p>
                </div>
            ) : null}

            {peek ? <QuickLook projectId={project.id} host={project.host} session={peek} onClose={() => setPeek(null)} onOpen={() => open(peek.id)} /> : null}
        </div>
    );
};

export default SessionsPage;
