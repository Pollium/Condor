import { Button, SkeletonPlaceholder, SkeletonText } from '@carbon/react';
import { Kpi } from '@condor/contracts/overview/domain';
import { Slice } from '@condor/contracts/shared/analytics';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Flag from '@/modules/overview/components/Flag';
import Loaded from '@/modules/overview/components/Loaded';
import Stats from '@/modules/overview/components/Stats';
import { useBreakdown } from '@/modules/overview/hooks/use-breakdown';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { copy } from '@/modules/overview/i18n';
import { deltaText, deltaTone } from '@/modules/overview/utils/kpis';
import { countryName, languageName, languageRegion, regionOf } from '@/modules/overview/utils/labels';
import Segmented from '@/shared/components/Segmented';
import { RowList } from '@/shared/components/RowList';
import { WorldMap } from '@/shared/components/WorldMap';
import { fmt } from '@/shared/utils/format';

type View = 'countries' | 'cities' | 'languages';

const LIMIT = 100;
const SHOWN = 6;

const VIEWS: { value: View; label: string }[] = [
    { value: 'countries', label: copy.places.countries },
    { value: 'cities', label: copy.places.cities },
    { value: 'languages', label: copy.places.languages }
];

const counted = (length: number) => length >= LIMIT ? `${fmt.n(LIMIT)}+` : fmt.n(length);

const Places = ({ people }: { people?: Kpi }) => {
    const navigate = useNavigate();
    const { projectId } = useScope();
    const [view, setView] = useState<View>('countries');
    const [expanded, setExpanded] = useState(false);
    const countries = useBreakdown('country', LIMIT);
    const cities = useBreakdown('city', LIMIT);
    const languages = useBreakdown(view === 'languages' ? 'language' : undefined, LIMIT);
    const query = view === 'countries' ? countries : view === 'cities' ? cities : languages;
    const top = countries.data?.slices[0];

    return (
        <section className='grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-0'>
            <div className='flex min-w-0 flex-col justify-between gap-6 lg:pr-10'>
                <h2 className='text-[1rem] font-normal text-foreground'>{copy.places.title}</h2>
                <Loaded query={countries} skeleton={<SkeletonPlaceholder className='aspect-[2/1] w-full max-w-none' />}>
                    {(breakdown) => (
                        <WorldMap
                            data={breakdown.slices.map((slice) => ({ code: slice.id, label: countryName(slice.id), value: slice.value }))}
                            className='mx-auto w-full max-w-[60rem]'
                        />
                    )}
                </Loaded>
                <Stats
                    items={[
                        { label: copy.places.countries, value: countries.data ? counted(countries.data.slices.length) : '—' },
                        { label: copy.places.cities, value: cities.data ? counted(cities.data.slices.length) : '—' },
                        {
                            label: top ? copy.places.outside(countryName(top.id)) : copy.places.outsideTop,
                            value: top && countries.data?.total ? fmt.pct((countries.data.total - top.value) / countries.data.total) : '—'
                        }
                    ]}
                />
            </div>

            <div className='flex min-w-0 flex-col gap-4 border-t border-separator pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0'>
                <div>
                    <p className='text-[0.8125rem] text-label-2'>{copy.kpis.people}</p>
                    <p className='text-[2.5rem] font-light leading-none tabular-nums'>{people ? fmt.n(people.value) : '—'}</p>
                    <p className='mt-1.5 text-[0.8125rem] text-label-2'>
                        {people ? <span className={deltaTone(people)}>{deltaText(people)}</span> : null} {copy.places.vsPrevious}
                    </p>
                </div>
                <Segmented
                    label={copy.places.groupBy}
                    choices={VIEWS}
                    value={view}
                    onChange={(next) => {
                        setView(next);
                        setExpanded(false);
                    }}
                    className='self-start'
                />
                <Loaded query={query} skeleton={<SkeletonText paragraph lineCount={SHOWN} />}>
                    {(breakdown) => {
                        const max = breakdown.slices[0]?.value ?? 0;
                        const shown = expanded ? breakdown.slices : breakdown.slices.slice(0, SHOWN);
                        const placed = (slice: Slice) => {
                            if(view === 'countries') return { label: countryName(slice.id), code: regionOf(slice.id) };
                            if(view === 'cities') return { label: slice.label, code: regionOf(slice.detail) };
                            return { label: languageName(slice.id), code: languageRegion(slice.id) };
                        };
                        return (
                            <>
                                <div className={expanded ? 'max-h-[25rem] overflow-y-auto [scrollbar-width:thin]' : ''}>
                                    <RowList
                                        label={copy.places.byPlace}
                                        onOpen={() => navigate(`/${projectId}/sesiones`)}
                                        empty={<p className='text-[0.8125rem] text-label-2'>{copy.places.noVisits}</p>}
                                        rows={shown.map((slice) => {
                                            const place = placed(slice);
                                            return {
                                                id: slice.id,
                                                text: place.label,
                                                title: place.label,
                                                leading: <Flag code={place.code} />,
                                                value: fmt.pct(breakdown.total ? slice.value / breakdown.total : 0),
                                                share: max ? slice.value / max : 0
                                            };
                                        })}
                                        valueClassName='w-12'
                                    />
                                </div>
                                {breakdown.slices.length > SHOWN ? (
                                    <Button kind='ghost' size='sm' onClick={() => setExpanded((value) => !value)} className='self-start'>
                                        {expanded ? copy.places.showLess : copy.places.showAll(counted(breakdown.slices.length))}
                                    </Button>
                                ) : null}
                            </>
                        );
                    }}
                </Loaded>
            </div>
        </section>
    );
};

export default Places;
