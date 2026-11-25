import { issueRoutes } from '@condor/contracts/issues/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { useNavigate } from 'react-router-dom';
import Loaded from '@/modules/overview/components/Loaded';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { copy } from '@/modules/overview/i18n';
import { RowList } from '@/shared/components/RowList';
import { fmt } from '@/shared/utils/format';

const TopIssues = () => {
    const navigate = useNavigate();
    const { projectId, period } = useScope();
    const query = useQuery(issueRoutes.list, { path: { projectId }, query: { period, status: 'open' } });

    return (
        <Loaded query={query}>
            {(issues) => (
                <RowList
                    label={copy.topIssues.label}
                    onOpen={(id) => navigate(`/${projectId}/errores?issue=${id}`)}
                    empty={<p className='text-[0.8125rem] text-label-2'>{copy.topIssues.empty}</p>}
                    rows={[...issues]
                        .sort((x, y) => y.sessions - x.sessions)
                        .slice(0, 5)
                        .map((issue) => ({
                            id: issue.id,
                            text: issue.message,
                            title: issue.message,
                            subtitle: issue.source ?? issue.errorType,
                            value: <span className='text-label-2'>{copy.topIssues.sessions(issue.sessions)}</span>,
                            meta: fmt.ago(issue.lastSeenAt)
                        }))}
                />
            )}
        </Loaded>
    );
};

export default TopIssues;
