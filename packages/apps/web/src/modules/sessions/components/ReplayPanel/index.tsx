import { SessionDetail } from '@condor/contracts/sessions/domain';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { useState } from 'react';
import ConsoleList from '@/modules/sessions/components/ConsoleList';
import NetworkList from '@/modules/sessions/components/NetworkList';
import PersonFacts from '@/modules/sessions/components/PersonFacts';
import TimelineList from '@/modules/sessions/components/TimelineList';
import type { Player } from '@/modules/sessions/hooks/use-replayer';
import type { Recording } from '@/modules/sessions/utils/replay';

interface ReplayPanelProps{
    session: SessionDetail;
    recording: Recording | null;
    lead: number;
    player: Player;
}

const PANEL = 'flex min-h-0 flex-1 flex-col p-0';

const ReplayPanel = ({ session, recording, lead, player }: ReplayPanelProps) => {
    const [tab, setTab] = useState(0);
    const errors = recording?.console.filter(({ entry }) => entry.level === 'error').length ?? 0;
    const failed = recording?.network.filter(({ entry }) => entry.failed || entry.status >= 500).length ?? 0;

    return (
        <section className='flex min-h-[32rem] min-w-0 flex-col overflow-hidden border-t border-separator xl:sticky xl:top-0 xl:h-[calc(100dvh-8rem)] xl:border-l xl:border-t-0 xl:pl-4'>
            <Tabs selectedIndex={tab} onChange={({ selectedIndex }) => setTab(selectedIndex)}>
                <TabList aria-label='Detalle de la sesión'>
                    <Tab>Eventos</Tab>
                    <Tab disabled={recording === null}>Consola{errors ? <span className='ml-1 text-danger'>{errors}</span> : null}</Tab>
                    <Tab disabled={recording === null}>Red{failed ? <span className='ml-1 text-danger'>{failed}</span> : null}</Tab>
                    <Tab>Persona</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel className={PANEL}>{tab === 0 ? <TimelineList timeline={session.timeline} lead={lead} player={player} /> : null}</TabPanel>
                    <TabPanel className={PANEL}>{tab === 1 && recording ? <ConsoleList entries={recording.console} player={player} /> : null}</TabPanel>
                    <TabPanel className={PANEL}>{tab === 2 && recording ? <NetworkList entries={recording.network} player={player} /> : null}</TabPanel>
                    <TabPanel className={PANEL}>{tab === 3 ? <PersonFacts session={session} /> : null}</TabPanel>
                </TabPanels>
            </Tabs>
        </section>
    );
};

export default ReplayPanel;
