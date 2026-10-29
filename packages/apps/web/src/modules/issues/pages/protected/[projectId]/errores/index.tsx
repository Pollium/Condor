import { IssueStatus } from '@condor/contracts/issues/domain';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { InlineNotification, Search } from '@carbon/react';
import { Debug } from '@carbon/icons-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { canEdit, useMe } from '@/modules/auth/hooks/use-me';
import { issuesApi } from '@/modules/issues/api/api';
import IssueDetail from '@/modules/issues/components/IssueDetail';
import { FILTERS, IssueFilter, issueTitle, sessionCount } from '@/modules/issues/utils/issue-copy';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/Page';
import { RowList } from '@/shared/components/RowList';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { useDebounced } from '@/shared/hooks/use-debounced';
import { usePeriodStore } from '@/shared/store/period';
import { errorCopy } from '@/shared/utils/error-copy';
import { fmt } from '@/shared/utils/format';

const failureCopy = errorCopy({ 'Issue::NotFound': 'Este error ya no existe.' });

const IssuesPage = () => {
    const project = useProject();
    const me = useMe();
    const period = usePeriodStore((state) => state.period);
    const [params, setParams] = useSearchParams();
    const [filter, setFilter] = useState<IssueFilter>('all');
    const [query, setQuery] = useState('');
    const search = useDebounced(query.trim(), 250);

    const list = useQuery(issuesApi.list, [project.id, { period, ...(filter === 'all' ? {} : { status: filter }), ...(search ? { search } : {}) }]);
    const rows = list.data ?? [];
    const issueId = params.get('issue') ?? rows[0]?.id;
    const detail = useQuery(issuesApi.get, [issueId ? project.id : undefined, issueId]);
    const update = useMutation(issuesApi.update, {
        onSuccess: () => {
            list.reload();
            detail.reload();
        }
    });

    const open = rows.filter((issue) => issue.status === 'open');
    const hint = list.data ? `${fmt.n(open.length)} sin resolver · ${fmt.n(open.reduce((sum, issue) => sum + issue.sessions, 0))} sesiones afectadas` : undefined;
    const failure = failureCopy(list.error ?? detail.error);

    const select = (id: string) => setParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set('issue', id);
        return next;
    }, { replace: true });

    const changeStatus = (status: IssueStatus) => {
        if(issueId) update.run(project.id, issueId, { status }).catch(() => undefined);
    };

    const empty = search || filter !== 'all'
        ? <EmptyState compact icon={Debug} title='Ningún error coincide' description='Prueba con otro estado o busca otra cosa.' />
        : <EmptyState compact icon={Debug} title='Sin errores en este periodo' description='Cuando tu app lance una excepción aparecerá aquí, agrupada con las demás del mismo tipo.' />;

    return (
        <div className='w-full'>
            <PageHeader title='Errores' hint={hint}>
                <Search size='sm' labelText='Buscar errores' placeholder='Buscar' closeButtonLabelText='Borrar la búsqueda' value={query} onChange={(event) => setQuery(event.target.value)} className='w-full sm:w-48' />
                <ToolbarMenu label='Estado' choices={FILTERS} value={filter} onChange={setFilter} />
            </PageHeader>

            {failure ? <InlineNotification kind='error' lowContrast hideCloseButton title={failure} className='mb-6' /> : null}

            <div className='grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]'>
                <RowList
                    label='Errores agrupados'
                    selected={issueId ?? null}
                    onSelect={select}
                    empty={list.data ? empty : undefined}
                    rows={rows.map((issue) => ({
                        id: issue.id,
                        text: issueTitle(issue),
                        title: issueTitle(issue),
                        subtitle: `${sessionCount(issue.sessions)} · ${fmt.ago(issue.lastSeenAt)}`,
                        dimmed: issue.status !== 'open'
                    }))}
                />
                {detail.data && detail.data.id === issueId ? (
                    <IssueDetail
                        issue={detail.data}
                        editable={canEdit(me.data)}
                        busy={update.loading}
                        failure={errorCopy()(update.error)}
                        onStatus={changeStatus}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default IssuesPage;
