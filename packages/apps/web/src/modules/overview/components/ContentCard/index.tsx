import { useNavigate } from 'react-router-dom';
import Shares from '@/modules/overview/components/Shares';
import Tabbed from '@/modules/overview/components/Tabbed';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { copy } from '@/modules/overview/i18n';

const ContentCard = () => {
    const navigate = useNavigate();
    const { projectId } = useScope();
    const toJourneys = () => navigate(`/${projectId}/recorridos`);

    return (
        <Tabbed
            title={copy.content.title}
            tabs={[
                {
                    id: 'top',
                    label: copy.content.top,
                    content: <Shares label={copy.content.topPages} dimension='page' show='count' onOpen={() => navigate(`/${projectId}/mapas-de-calor`)} />
                },
                { id: 'entries', label: copy.content.entries, content: <Shares label={copy.content.entryPages} dimension='entry' onOpen={toJourneys} /> },
                { id: 'exits', label: copy.content.exits, content: <Shares label={copy.content.exitPages} dimension='exit' onOpen={toJourneys} /> }
            ]}
        />
    );
};

export default ContentCard;
