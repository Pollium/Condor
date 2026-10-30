import Shares from '@/modules/overview/components/Shares';
import Tabbed from '@/modules/overview/components/Tabbed';
import { copy } from '@/modules/overview/i18n';

const AcquisitionCard = () => (
    <Tabbed
        title={copy.acquisition.title}
        tabs={[
            { id: 'channels', label: copy.acquisition.channels, content: <Shares label={copy.acquisition.channels} dimension='channel' /> },
            { id: 'sources', label: copy.acquisition.sources, content: <Shares label={copy.acquisition.sources} dimension='source' /> },
            { id: 'campaigns', label: copy.acquisition.campaigns, content: <Shares label={copy.acquisition.campaigns} dimension='campaign' /> }
        ]}
    />
);

export default AcquisitionCard;
