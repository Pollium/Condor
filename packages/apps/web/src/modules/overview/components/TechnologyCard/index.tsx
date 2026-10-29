import Shares from '@/modules/overview/components/Shares';
import Tabbed from '@/modules/overview/components/Tabbed';

const TechnologyCard = () => (
    <Tabbed
        title='Tecnología'
        tabs={[
            { id: 'systems', label: 'Sistema', content: <Shares label='Sistemas operativos' dimension='os' /> },
            { id: 'browsers', label: 'Navegador', content: <Shares label='Navegadores' dimension='browser' /> },
            { id: 'devices', label: 'Dispositivo', content: <Shares label='Dispositivos' dimension='device' /> },
            { id: 'screens', label: 'Pantalla', content: <Shares label='Pantallas' dimension='screen' /> },
            { id: 'network', label: 'Red', content: <Shares label='Conexión' dimension='connection' /> }
        ]}
    />
);

export default TechnologyCard;
