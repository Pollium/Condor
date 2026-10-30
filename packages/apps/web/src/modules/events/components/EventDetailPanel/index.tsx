import { InlineLoading } from '@carbon/react';
import { EventDetail } from '@condor/contracts/events/domain';
import { PeriodQuery } from '@condor/contracts/shared/period';
import { SegmentQuery } from '@condor/contracts/shared/segment';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { useState } from 'react';
import { eventsApi } from '@/modules/events/api/api';
import { copy } from '@/modules/events/i18n';
import { bucketLabel } from '@/modules/overview/utils/kpis';
import { people } from '@/modules/retention/utils/cohort-copy';
import { TrendChart } from '@/shared/components/Charts';
import { Section, Stack } from '@/shared/components/Page';
import { RowList } from '@/shared/components/RowList';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { intlLocale } from '@/shared/i18n/locale';
import { fmt } from '@/shared/utils/format';

interface EventDetailPanelProps{
    projectId: string;
    detail: EventDetail;
    query: PeriodQuery & SegmentQuery;
}

const ratio = new Intl.NumberFormat(intlLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const changeOf = (current: number, previous: number): string =>
    previous === 0 ? copy.detail.noPrevious : copy.detail.vsPrevious(fmt.signed(current / previous - 1));

const EventDetailPanel = ({ projectId, detail, query }: EventDetailPanelProps) => {
    const [picked, setPicked] = useState<{ event: string; key: string } | null>(null);
    const key = picked?.event === detail.name ? picked.key : detail.properties[0]?.key ?? null;
    const breakdown = useQuery(eventsApi.property, [key === null ? undefined : projectId, detail.name, key ?? '', query]);
    const values = breakdown.data?.key === key ? breakdown.data : undefined;

    return (
        <Stack>
            <StatRow columns={3}>
                <StatTile label={copy.detail.times} value={fmt.n(detail.count)} hint={changeOf(detail.count, detail.previousCount)} />
                <StatTile label={copy.detail.people} value={fmt.n(detail.people)} />
                <StatTile label={copy.detail.perPerson} value={detail.people === 0 ? '—' : ratio.format(detail.count / detail.people)} />
            </StatRow>
            <Section title={copy.detail.overTime}>
                <TrendChart
                    kind='bar'
                    unit={copy.detail.times}
                    format={fmt.n}
                    data={detail.series.map((bucket) => ({ label: bucketLabel(detail.period, bucket.label), value: bucket.count }))}
                />
            </Section>
            <Section
                title={copy.detail.properties}
                aside={key === null ? null : (
                    <ToolbarMenu
                        label={copy.detail.property}
                        choices={detail.properties.map((property) => ({ value: property.key, label: property.key }))}
                        value={key}
                        onChange={(chosen) => setPicked({ event: detail.name, key: chosen })}
                    />
                )}
            >
                {key === null ? <p className='text-[0.875rem] text-label-2'>{copy.detail.noProperties}</p> : null}
                {key !== null && !values ? <InlineLoading description={copy.detail.counting} /> : null}
                {values ? (
                    <RowList
                        label={copy.detail.valuesOf(key ?? '')}
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
