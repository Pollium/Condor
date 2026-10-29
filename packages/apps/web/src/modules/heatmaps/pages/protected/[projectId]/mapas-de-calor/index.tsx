import { HeatMode, HeatWidth, Heatmap } from '@condor/contracts/heatmaps/domain';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { InlineNotification } from '@carbon/react';
import { Cursor_1 } from '@carbon/icons-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { heatmapsApi } from '@/modules/heatmaps/api/api';
import HeatFrame from '@/modules/heatmaps/components/HeatFrame';
import HeatPanel from '@/modules/heatmaps/components/HeatPanel';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/Page';
import type { Choice } from '@/shared/components/Segmented';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { usePeriodStore } from '@/shared/store/period';
import { errorCopy } from '@/shared/utils/error-copy';
import { fmt } from '@/shared/utils/format';

const MODES: Choice<HeatMode>[] = [
    { value: 'clicks', label: 'Clics' },
    { value: 'rage', label: 'Clics de rabia' },
    { value: 'scroll', label: 'Scroll' }
];

const WIDTHS: Choice<HeatWidth>[] = [
    { value: 'desktop', label: 'Escritorio' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'mobile', label: 'Móvil' }
];

const HeatmapsPage = () => {
    const project = useProject();
    const period = usePeriodStore((state) => state.period);
    const [params, setParams] = useSearchParams();
    const [mode, setMode] = useState<HeatMode>('clicks');
    const [width, setWidth] = useState<HeatWidth>('desktop');
    const [selected, setSelected] = useState<string | null>(null);
    const [shown, setShown] = useState<Heatmap | null>(null);

    const pages = useQuery(heatmapsApi.pages, [project.id, period]);
    const path = params.get('path') ?? pages.data?.[0]?.path;
    const query = path ? { path, mode, width, period } : undefined;
    const heatmap = useQuery(heatmapsApi.heatmap, [query ? project.id : undefined, query]);
    if(heatmap.data && heatmap.data !== shown) setShown(heatmap.data);
    const current = heatmap.data ?? shown;

    const choices = useMemo(() => {
        const list = (pages.data ?? []).map((page) => ({ value: page.path, label: page.path }));
        return path && !list.some((choice) => choice.value === path) ? [{ value: path, label: path }, ...list] : list;
    }, [pages.data, path]);

    const spots = useMemo(() => (current?.elements ?? [])
        .map((element) => ({ selector: element.selector, label: element.text ?? element.selector, count: current?.mode === 'rage' ? element.rage : element.clicks }))
        .filter((spot) => spot.count > 0)
        .sort((a, b) => b.count - a.count), [current]);

    const page = pages.data?.find((entry) => entry.path === path);
    const picked = spots.find((spot) => spot.selector === selected) ?? null;
    const failure = errorCopy()(pages.error ?? heatmap.error);

    const choosePath = (next: string) => {
        setSelected(null);
        setParams((previous) => {
            const updated = new URLSearchParams(previous);
            updated.set('path', next);
            return updated;
        }, { replace: true });
    };

    return (
        <div className='w-full'>
            <PageHeader title='Mapas de calor' hint={page ? `${fmt.n(page.views)} vistas · ${fmt.n(page.clicks)} clics` : undefined}>
                {choices.length ? <ToolbarMenu label='Página' choices={choices} value={path ?? ''} onChange={choosePath} /> : null}
                <ToolbarMenu label='Modo' choices={MODES} value={mode} onChange={(next) => { setSelected(null); setMode(next); }} />
                <ToolbarMenu label='Ancho' choices={WIDTHS} value={width} onChange={setWidth} />
            </PageHeader>

            {failure ? <InlineNotification kind='error' lowContrast hideCloseButton title={failure} className='mb-6' /> : null}

            {pages.data && !pages.data.length && !params.get('path') ? (
                <EmptyState icon={Cursor_1} title='Aún no hay clics que dibujar' description='Cuando las personas visiten tu app y hagan clic, cada página tendrá aquí su mapa de calor.' />
            ) : current ? (
                <div className='grid grid-cols-1 gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1fr)_20rem]'>
                    <HeatFrame projectId={project.id} host={project.host} heatmap={current} picked={picked} />
                    <HeatPanel heatmap={current} spots={spots} selected={selected} onSelect={setSelected} />
                </div>
            ) : null}
        </div>
    );
};

export default HeatmapsPage;
