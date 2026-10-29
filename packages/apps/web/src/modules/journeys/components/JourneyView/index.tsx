import { Journey, JOURNEY_EXIT, JOURNEY_OTHER } from '@condor/contracts/journeys/domain';
import Sankey from '@/modules/journeys/components/Sankey';
import { Legend, Section, Stack } from '@/shared/components/Page';
import { RowList } from '@/shared/components/RowList';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import { fmt } from '@/shared/utils/format';

const sessions = (count: number) => `${fmt.n(count)} ${count === 1 ? 'sesión' : 'sesiones'}`;

const pages = (count: number) => `${count} ${count === 1 ? 'página' : 'páginas'}`;

const JourneyView = ({ journey }: { journey: Journey }) => {
    const top = journey.routes[0];
    const has = (path: string) => journey.nodes.some((node) => node.path === path);
    const stayed = journey.sessions - journey.leftAfterFirst;

    return (
        <Stack>
            <StatRow columns={3}>
                <StatTile
                    label='Sesiones'
                    value={fmt.n(journey.sessions)}
                    hint={journey.start ? `Empiezan en ${journey.start}` : 'Con al menos una página vista'}
                />
                <StatTile
                    label='Siguen tras el primer paso'
                    value={fmt.pct(journey.sessions ? stayed / journey.sessions : 0)}
                    hint={`${sessions(journey.leftAfterFirst)} se van en la primera página`}
                />
                <StatTile
                    label='Ruta más común'
                    value={top?.paths[0] ?? '—'}
                    hint={top ? `${top.paths.length > 1 ? `→ ${top.paths.slice(1).join(' → ')}` : 'Y se van'} · ${sessions(top.sessions)}` : undefined}
                />
            </StatRow>

            <Section
                title='Flujo entre páginas'
                aside={
                    <Legend
                        items={[
                            { label: 'Página', className: 'bg-accent' },
                            ...(has(JOURNEY_OTHER) ? [{ label: 'Otras páginas', className: 'bg-foreground/40' }] : []),
                            ...(has(JOURNEY_EXIT) ? [{ label: 'Salida', className: 'bg-foreground/25' }] : [])
                        ]}
                    />
                }
            >
                <div className='overflow-x-auto [scrollbar-width:none]'>
                    <Sankey journey={journey} />
                </div>
                <p className='text-[0.8125rem] text-muted'>Pasa el cursor por una página o una franja para ver cuántas sesiones siguen ese camino.</p>
            </Section>

            <Section title='Rutas más comunes'>
                <RowList
                    label='Rutas más comunes'
                    empty={<p className='text-[0.875rem] text-label-2'>Aún no hay rutas que mostrar.</p>}
                    rows={journey.routes.map((route) => ({
                        id: route.paths.join('>'),
                        text: route.paths.join(' → '),
                        title: route.paths.join(' → '),
                        subtitle: route.paths.length < journey.steps ? `${pages(route.paths.length)} y se van` : pages(route.paths.length),
                        value: fmt.n(route.sessions),
                        meta: fmt.pct(journey.sessions ? route.sessions / journey.sessions : 0)
                    }))}
                />
            </Section>
        </Stack>
    );
};

export default JourneyView;
