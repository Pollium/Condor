import Shares from '@/modules/overview/components/Shares';
import Tabbed from '@/modules/overview/components/Tabbed';
import { copy } from '@/modules/overview/i18n';

const TechnologyCard = () => (
    <Tabbed
        title={copy.technology.title}
        tabs={[
            { id: 'systems', label: copy.technology.system, content: <Shares label={copy.technology.systems} dimension='os' /> },
            { id: 'browsers', label: copy.technology.browser, content: <Shares label={copy.technology.browsers} dimension='browser' /> },
            { id: 'devices', label: copy.technology.device, content: <Shares label={copy.technology.devices} dimension='device' /> },
            { id: 'screens', label: copy.technology.screen, content: <Shares label={copy.technology.screens} dimension='screen' /> },
            { id: 'network', label: copy.technology.network, content: <Shares label={copy.technology.connection} dimension='connection' /> }
        ]}
    />
);

export default TechnologyCard;
