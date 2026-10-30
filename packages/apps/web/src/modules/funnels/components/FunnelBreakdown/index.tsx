import { FunnelResult } from '@condor/contracts/funnels/domain';
import { Section } from '@/shared/components/Page';
import { RowList } from '@/shared/components/RowList';
import { copy } from '@/modules/funnels/i18n';
import { DEVICES, median } from '@/modules/funnels/utils/funnel-copy';
import { fmt } from '@/shared/utils/format';

const FunnelBreakdown = ({ result }: { result: FunnelResult }) => {
    const last = result.steps[result.steps.length - 1];
    const devices = result.byDevice
        .map((entry) => {
            const start = entry.people[0] ?? 0;
            const end = entry.people[entry.people.length - 1] ?? 0;
            return { device: entry.device, start, end, rate: start ? end / start : 0 };
        })
        .filter((entry) => entry.start > 0)
        .sort((a, b) => b.rate - a.rate);

    return (
        <div className='grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'>
            <Section title={copy.breakdown.steps}>
                <RowList
                    label={copy.breakdown.stepsLabel}
                    rows={result.steps.map((step, index) => ({
                        id: `${index}`,
                        text: step.label,
                        leading: <span className='w-5 shrink-0 text-[0.8125rem] tabular-nums text-label-3'>{index + 1}</span>,
                        title: step.label,
                        subtitle: index === 0
                            ? step.match
                            : copy.breakdown.stepDetail(step.match, result.steps[index - 1].people - step.people, median(step.medianSeconds)),
                        value: fmt.n(step.people),
                        meta: index === 0 ? copy.breakdown.start : copy.breakdown.ofPrevious(fmt.pct(step.fromPrevious))
                    }))}
                />
            </Section>

            <Section title={copy.breakdown.devices}>
                <RowList
                    label={copy.breakdown.devices}
                    empty={<p className='text-[0.875rem] text-label-2'>{copy.breakdown.noDevices}</p>}
                    rows={devices.map((entry) => ({
                        id: entry.device,
                        text: DEVICES[entry.device],
                        title: DEVICES[entry.device],
                        subtitle: copy.breakdown.deviceDetail(entry.start, entry.end, last.label),
                        value: fmt.pct(entry.rate)
                    }))}
                />
            </Section>
        </div>
    );
};

export default FunnelBreakdown;
