import Shares from '@/modules/overview/components/Shares';
import Tabbed from '@/modules/overview/components/Tabbed';

const AcquisitionCard = () => (
    <Tabbed
        title='Adquisición'
        tabs={[
            { id: 'channels', label: 'Canales', content: <Shares label='Canales' dimension='channel' /> },
            { id: 'sources', label: 'Fuentes', content: <Shares label='Fuentes' dimension='source' /> },
            { id: 'campaigns', label: 'Campañas', content: <Shares label='Campañas' dimension='campaign' /> }
        ]}
    />
);

export default AcquisitionCard;
