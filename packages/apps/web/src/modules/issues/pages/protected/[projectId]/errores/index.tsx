import { IssueStatus } from '@condor/contracts/issues/domain';
import { issueRoutes } from '@condor/contracts/issues/routes';
import { describeError } from '@pollium/readable-react/errors/copy';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { InlineNotification, Search } from '@carbon/react';
import { Debug } from '@carbon/icons-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { canEdit, useMe } from '@/modules/auth/hooks/use-me';
import IssueDetail from '@/modules/issues/components/IssueDetail';
import { copy } from '@/modules/issues/i18n';
import { FILTERS, IssueFilter, issueTitle, sessionCount } from '@/modules/issues/utils/issue-copy';
import { issueError } from '@/modules/issues/utils/issue-error';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/Page';
import { RowList } from '@/shared/components/RowList';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { useDebounced } from '@/shared/hooks/use-debounced';
import { copy as shared } from '@/shared/i18n';
import { usePeriodStore } from '@/shared/store/period';
import { fmt } from '@/shared/utils/format';

const IssuesPage = () => {
    const project = useProject();
    const me = useMe();
    const period = usePeriodStore((state) => state.period);
    const [params, setParams] = useSearchParams();
    const [filter, setFilter] = useState<IssueFilter>('all');
    const [query, setQuery] = useState('');
    const search = useDebounced(query.trim(), 250);

    const list = useQuery(issueRoutes.list, {
        path: { projectId: project.id },
        query: { period, status: filter === 'all' ? undefined : filter, search: search || undefined }
    });
    const rows = list.data ?? [];
    const issueId = params.get('issue') ?? rows[0]?.id;
    const detail = useQuery(issueRoutes.get, { path: { projectId: project.id, issueId } });
    const update = useMutation(issueRoutes.update, { path: { projectId: project.id, issueId } });

    const open = rows.filter((issue) => issue.status === 'open');
    const hint = list.data ? copy.page.hint(open.length, open.reduce((sum, issue) => sum + issue.sessions, 0)) : undefined;
    const failure = issueError(list.error ?? detail.error);

    const select = (id: string) => setParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set('issue', id);
        return next;
    }, { replace: true });

    const changeStatus = (status: IssueStatus) => {
        if(issueId) update.run({ body: { status } }).catch(() => undefined);
    };

    const empty = search || filter !== 'all'
        ? <EmptyState compact icon={Debug} title={copy.page.noMatch} description={copy.page.noMatchHint} />
        : <EmptyState compact icon={Debug} title={copy.page.empty} description={copy.page.emptyHint} />;

    return (
        <div className='w-full'>
            <PageHeader title={shared.views.issues} hint={hint}>
                <Search size='sm' labelText={copy.page.searchLabel} placeholder={copy.page.searchPlaceholder} closeButtonLabelText={copy.page.clearSearch} value={query} onChange={(event) => setQuery(event.target.value)} className='w-full sm:w-48' />
                <ToolbarMenu label={copy.page.status} choices={FILTERS} value={filter} onChange={setFilter} />
            </PageHeader>

            {failure ? <InlineNotification kind='error' lowContrast hideCloseButton title={failure} className='mb-6' /> : null}

            <div className='grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]'>
                <RowList
                    label={copy.page.grouped}
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
                        failure={describeError(update.error)}
                        onStatus={changeStatus}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default IssuesPage;
