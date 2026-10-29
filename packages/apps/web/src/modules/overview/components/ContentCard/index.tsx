import { useNavigate } from 'react-router-dom';
import Shares from '@/modules/overview/components/Shares';
import Tabbed from '@/modules/overview/components/Tabbed';
import { useScope } from '@/modules/overview/hooks/use-scope';

const ContentCard = () => {
    const navigate = useNavigate();
    const { projectId } = useScope();
    const toJourneys = () => navigate(`/${projectId}/recorridos`);

    return (
        <Tabbed
            title='Contenido'
            tabs={[
                {
                    id: 'top',
                    label: 'Más vistas',
                    content: <Shares label='Páginas más vistas' dimension='page' show='count' onOpen={() => navigate(`/${projectId}/mapas-de-calor`)} />
                },
                { id: 'entries', label: 'Entrada', content: <Shares label='Páginas de entrada' dimension='entry' onOpen={toJourneys} /> },
                { id: 'exits', label: 'Salida', content: <Shares label='Páginas de salida' dimension='exit' onOpen={toJourneys} /> }
            ]}
        />
    );
};

export default ContentCard;
