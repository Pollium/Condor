import { InlineLoading } from '@carbon/react';
import { EventDetail } from '@condor/contracts/events/domain';
import { PeriodQuery } from '@condor/contracts/shared/period';
import { SegmentQuery } from '@condor/contracts/shared/segment';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { useState } from 'react';
import { eventsApi } from '@/modules/events/api/api';
import { bucketLabel } from '@/modules/overview/utils/kpis';
import { people } from '@/modules/retention/utils/cohort-copy';
import { TrendChart } from '@/shared/components/Charts';
import { Section, Stack } from '@/shared/components/Page';
import { RowList } from '@/shared/components/RowList';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { fmt } from '@/shared/utils/format';

interface EventDetailPanelProps{
    projectId: string;
    detail: EventDetail;
    query: PeriodQuery & SegmentQuery;
}

const changeOf = (current: number, previous: number): string =>
    previous === 0 ? 'sin datos del periodo anterior' : `${fmt.signed(current / previous - 1)} vs. el periodo anterior`;

const EventDetailPanel = ({ projectId, detail, query }: EventDetailPanelProps) => {
    const [picked, setPicked] = useState<{ event: string; key: string } | null>(null);
    const key = picked?.event === detail.name ? picked.key : detail.properties[0]?.key ?? null;
    const breakdown = useQuery(eventsApi.property, [key === null ? undefined : projectId, detail.name, key ?? '', query]);
    const values = breakdown.data?.key === key ? breakdown.data : undefined;

    return (
        <Stack>
            <StatRow columns={3}>
                <StatTile label='Veces' value={fmt.n(detail.count)} hint={changeOf(detail.count, detail.previousCount)} />
                <StatTile label='Personas' value={fmt.n(detail.people)} />
                <StatTile label='Por persona' value={detail.people === 0 ? '—' : (detail.count / detail.people).toFixed(1)} />
            </StatRow>
            <Section title='En el tiempo'>
                <TrendChart
                    kind='bar'
                    unit='Veces'
                    format={fmt.n}
                    data={detail.series.map((bucket) => ({ label: bucketLabel(detail.period, bucket.label), value: bucket.count }))}
                />
            </Section>
            <Section
                title='Propiedades'
                aside={key === null ? null : (
                    <ToolbarMenu
                        label='Propiedad'
                        choices={detail.properties.map((property) => ({ value: property.key, label: property.key }))}
                        value={key}
                        onChange={(chosen) => setPicked({ event: detail.name, key: chosen })}
                    />
                )}
            >
                {key === null ? <p className='text-[0.875rem] text-label-2'>Este evento llega sin propiedades.</p> : null}
                {key !== null && !values ? <InlineLoading description='Contando los valores…' /> : null}
                {values ? (
                    <RowList
                        label={`Valores de ${key}`}
                        rows={values.values.map((entry) => ({
                            id: entry.value,
                            text: entry.value,
                            title: entry.value,
                            subtitle: people(entry.people),
                            value: fmt.n(entry.count),
                            share: values.total === 0 ? 0 : entry.count / values.total
                        }))}
                    />
                ) : null}
            </Section>
        </Stack>
    );
};

export default EventDetailPanel;
