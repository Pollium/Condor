import { useNavigate } from 'react-router-dom';
import Shares from '@/modules/overview/components/Shares';
import Tabbed from '@/modules/overview/components/Tabbed';
import TopIssues from '@/modules/overview/components/TopIssues';
import Vitals from '@/modules/overview/components/Vitals';
import { useScope } from '@/modules/overview/hooks/use-scope';

const PerformanceCard = () => {
    const navigate = useNavigate();
    const { projectId } = useScope();

    return (
        <Tabbed
            title='Rendimiento'
            tabs={[
                { id: 'vitals', label: 'Web Vitals', content: <Vitals /> },
                { id: 'errors', label: 'Errores', content: <TopIssues /> },
                {
                    id: 'releases',
                    label: 'Versiones',
                    content: <Shares label='Versiones de la app' dimension='release' onOpen={() => navigate(`/${projectId}/errores`)} />
                }
            ]}
        />
    );
};

export default PerformanceCard;
