import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { KpiKey, Summary } from '@condor/contracts/overview/domain';
import { useState } from 'react';
import AudienceChart from '@/modules/overview/components/AudienceChart';
import { copy } from '@/modules/overview/i18n';
import { bucketLabel, deltaText, deltaTone, KPI_VIEWS } from '@/modules/overview/utils/kpis';
import { Legend } from '@/shared/components/Page';
import { TrendChart } from '@/shared/components/Charts';

const Trend = ({ summary, selected }: { summary: Summary; selected: KpiKey }) => {
    const labels = summary.buckets.map((bucket) => bucketLabel(summary.period, bucket));
    if(selected !== 'sessions'){
        const view = KPI_VIEWS[selected];
        const kpi = summary.kpis.find((entry) => entry.key === selected);
        const data = (kpi?.series ?? []).map((value, index) => ({ label: labels[index] ?? '', value }));
        return <TrendChart data={data} kind={view.kind} unit={view.label} format={view.axis} />;
    }
    return (
        <div className='flex flex-col gap-3'>
            <AudienceChart buckets={summary.audience.map((point, index) => ({ label: labels[index] ?? '', ...point }))} />
            <Legend
                items={[
                    { label: copy.audience.returning, className: 'bg-accent' },
                    { label: copy.audience.fresh, className: 'bg-fill-strong' }
                ]}
            />
        </div>
    );
};

const Trends = ({ summary }: { summary: Summary }) => {
    const [selected, setSelected] = useState<KpiKey>('sessions');
    const index = Math.max(0, summary.kpis.findIndex((kpi) => kpi.key === selected));

    return (
        <section className='min-w-0'>
            <Tabs selectedIndex={index} onChange={({ selectedIndex }) => setSelected(summary.kpis[selectedIndex].key)}>
                <TabList aria-label={copy.trends.indicator} className='max-h-none'>
                    {summary.kpis.map((kpi) => (
                        <Tab key={kpi.key} className='min-w-[9.5rem] py-3'>
                            <span className='flex flex-col items-start'>
                                <span className='text-[0.8125rem] font-normal text-label-2'>{KPI_VIEWS[kpi.key].label}</span>
                                <span className='text-[1.75rem] font-light leading-tight tabular-nums text-foreground'>{KPI_VIEWS[kpi.key].format(kpi.value)}</span>
                                <span className={`text-[0.8125rem] font-normal tabular-nums ${deltaTone(kpi)}`}>{deltaText(kpi)}</span>
                            </span>
                        </Tab>
                    ))}
                </TabList>
                <TabPanels>
                    {summary.kpis.map((kpi) => (
                        <TabPanel key={kpi.key} className='px-0 pb-0 pt-4'>
                            {kpi.key === selected ? <Trend summary={summary} selected={selected} /> : null}
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
        </section>
    );
};

export default Trends;
