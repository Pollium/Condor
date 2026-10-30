import { useNavigate } from 'react-router-dom';
import Shares from '@/modules/overview/components/Shares';
import Tabbed from '@/modules/overview/components/Tabbed';
import TopIssues from '@/modules/overview/components/TopIssues';
import Vitals from '@/modules/overview/components/Vitals';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { copy } from '@/modules/overview/i18n';
import { copy as shared } from '@/shared/i18n';

const PerformanceCard = () => {
    const navigate = useNavigate();
    const { projectId } = useScope();

    return (
        <Tabbed
            title={copy.performance.title}
            tabs={[
                { id: 'vitals', label: 'Web Vitals', content: <Vitals /> },
                { id: 'errors', label: shared.views.issues, content: <TopIssues /> },
                {
                    id: 'releases',
                    label: copy.performance.releases,
                    content: <Shares label={copy.performance.appReleases} dimension='release' onOpen={() => navigate(`/${projectId}/errores`)} />
                }
            ]}
        />
    );
};

export default PerformanceCard;
