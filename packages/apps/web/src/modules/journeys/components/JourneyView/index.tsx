import { Journey, JOURNEY_EXIT, JOURNEY_OTHER } from '@condor/contracts/journeys/domain';
import Sankey from '@/modules/journeys/components/Sankey';
import { copy } from '@/modules/journeys/i18n';
import { Legend, Section, Stack } from '@/shared/components/Page';
import { RowList } from '@/shared/components/RowList';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import { fmt } from '@/shared/utils/format';

const JourneyView = ({ journey }: { journey: Journey }) => {
    const top = journey.routes[0];
    const has = (path: string) => journey.nodes.some((node) => node.path === path);
    const stayed = journey.sessions - journey.leftAfterFirst;

    return (
        <Stack>
            <StatRow columns={3}>
                <StatTile
                    label={copy.view.sessions}
                    value={fmt.n(journey.sessions)}
                    hint={journey.start ? copy.view.startsAt(journey.start) : copy.view.anyStart}
                />
                <StatTile
                    label={copy.view.continued}
                    value={fmt.pct(journey.sessions ? stayed / journey.sessions : 0)}
                    hint={copy.view.leftFirst(journey.leftAfterFirst)}
                />
                <StatTile
                    label={copy.view.topRoute}
                    value={top?.paths[0] ?? '—'}
                    hint={top ? `${top.paths.length > 1 ? `→ ${top.paths.slice(1).join(' → ')}` : copy.view.thenLeave} · ${copy.view.sessionCount(top.sessions)}` : undefined}
                />
            </StatRow>

            <Section
                title={copy.view.flow}
                aside={
                    <Legend
                        items={[
                            { label: copy.nodes.page, className: 'bg-accent' },
                            ...(has(JOURNEY_OTHER) ? [{ label: copy.nodes.other, className: 'bg-foreground/40' }] : []),
                            ...(has(JOURNEY_EXIT) ? [{ label: copy.nodes.exit, className: 'bg-foreground/25' }] : [])
                        ]}
                    />
                }
            >
                <div className='overflow-x-auto [scrollbar-width:none]'>
                    <Sankey journey={journey} />
                </div>
                <p className='text-[0.8125rem] text-muted'>{copy.view.hover}</p>
            </Section>

            <Section title={copy.view.routes}>
                <RowList
                    label={copy.view.routes}
                    empty={<p className='text-[0.875rem] text-label-2'>{copy.view.noRoutes}</p>}
                    rows={journey.routes.map((route) => ({
                        id: route.paths.join('>'),
                        text: route.paths.join(' → '),
                        title: route.paths.join(' → '),
                        subtitle: route.paths.length < journey.steps ? copy.view.pagesThenLeave(route.paths.length) : copy.view.pages(route.paths.length),
                        value: fmt.n(route.sessions),
                        meta: fmt.pct(journey.sessions ? route.sessions / journey.sessions : 0)
                    }))}
                />
            </Section>
        </Stack>
    );
};

export default JourneyView;
