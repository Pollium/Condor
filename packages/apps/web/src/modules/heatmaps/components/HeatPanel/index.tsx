import { Heatmap } from '@condor/contracts/heatmaps/domain';
import { ProgressBar } from '@carbon/react';
import { Cursor_1 } from '@carbon/icons-react';
import { PickedElement } from '@/modules/heatmaps/components/HeatFrame';
import { copy } from '@/modules/heatmaps/i18n';
import EmptyState from '@/shared/components/EmptyState';
import { Section } from '@/shared/components/Page';
import { RowList } from '@/shared/components/RowList';
import { fmt } from '@/shared/utils/format';

interface HeatPanelProps{
    heatmap: Heatmap;
    spots: PickedElement[];
    selected: string | null;
    onSelect: (selector: string) => void;
}

const DEPTHS = [0, 25, 50, 75, 100];

const HeatPanel = ({ heatmap, spots, selected, onSelect }: HeatPanelProps) => {
    const rage = heatmap.mode === 'rage';
    const total = Math.max(heatmap.clicks, spots.reduce((sum, spot) => sum + spot.count, 0));
    const perSession = heatmap.sessions ? Math.round((heatmap.clicks / heatmap.sessions) * 10) / 10 : 0;
    const facts = [
        { label: copy.panel.sessions, value: fmt.n(heatmap.sessions) },
        { label: rage ? copy.panel.rageClicks : copy.panel.clicks, value: copy.panel.perSession(heatmap.clicks, perSession) },
        { label: copy.panel.averageScroll, value: fmt.pct(heatmap.averageDepth) }
    ];

    return (
        <div className='flex min-w-0 flex-col gap-8'>
            <dl className='flex flex-col gap-3'>
                {facts.map((fact) => (
                    <div key={fact.label} className='flex items-baseline justify-between gap-4'>
                        <dt className='text-[0.8125rem] text-label-2'>{fact.label}</dt>
                        <dd className='text-right text-[0.875rem] tabular-nums text-foreground'>{fact.value}</dd>
                    </div>
                ))}
            </dl>

            {heatmap.mode === 'scroll' ? (
                <Section title={copy.panel.reach}>
                    <ul className='flex flex-col'>
                        {DEPTHS.map((depth) => {
                            const share = heatmap.reach.find((entry) => entry.depth === depth)?.share ?? 0;
                            return (
                                <li key={depth} className='flex items-center gap-3 py-2.5'>
                                    <span className='w-20 shrink-0 text-[0.875rem] text-foreground'>{depth === 0 ? copy.panel.top : copy.panel.depth(depth)}</span>
                                    <ProgressBar label={copy.panel.reached(depth)} hideLabel size='small' value={share * 100} className='flex-1' />
                                    <span className='w-12 text-right text-[0.875rem] tabular-nums text-label-2'>{fmt.pct(share)}</span>
                                </li>
                            );
                        })}
                    </ul>
                </Section>
            ) : (
                <>
                    <div className='flex items-center gap-2 text-[0.75rem] text-label-2'>
                        {copy.panel.few}
                        <span className='h-1.5 flex-1' style={{ background: 'linear-gradient(90deg, rgba(255, 149, 0, 0.2), rgb(255, 149, 0), rgb(255, 59, 48))' }} />
                        {copy.panel.many}
                    </div>
                    <Section title={rage ? copy.panel.frustration : copy.panel.mostClicked}>
                        <RowList
                            label={rage ? copy.panel.rageElements : copy.panel.clickedElements}
                            selected={selected}
                            onSelect={onSelect}
                            empty={
                                <EmptyState
                                    compact
                                    icon={Cursor_1}
                                    title={rage ? copy.panel.noRageTitle : copy.panel.noClicksTitle}
                                    description={rage ? copy.panel.noRageDescription : copy.panel.noClicksDescription}
                                />
                            }
                            rows={spots.map((spot) => ({
                                id: spot.selector,
                                text: spot.label,
                                title: spot.label,
                                value: <span className='text-label-2'>{fmt.pct(total ? spot.count / total : 0)}</span>
                            }))}
                        />
                    </Section>
                </>
            )}
        </div>
    );
};

export default HeatPanel;
