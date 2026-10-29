import { useState, type ReactNode } from 'react';
import { Section } from '@/shared/components/Page';
import Segmented from '@/shared/components/Segmented';

export interface Tab{
    id: string;
    label: string;
    content: ReactNode;
}

const Tabbed = ({ title, tabs, lead }: { title: string; tabs: Tab[]; lead?: ReactNode }) => {
    const [active, setActive] = useState(tabs[0].id);

    return (
        <Section
            title={title}
            aside={
                <div className='max-w-full overflow-x-auto [scrollbar-width:none]'>
                    <Segmented label={title} choices={tabs.map((tab) => ({ value: tab.id, label: tab.label }))} value={active} onChange={setActive} />
                </div>
            }
        >
            {lead}
            {tabs.find((tab) => tab.id === active)?.content}
        </Section>
    );
};

export default Tabbed;
