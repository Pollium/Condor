import { Heatmap } from '@condor/contracts/heatmaps/domain';
import { useEffect, useMemo, useRef } from 'react';
import ElementOutline, { OutlineBox } from '@/modules/heatmaps/components/ElementOutline';
import PageSilhouette from '@/modules/heatmaps/components/PageSilhouette';
import ScrollBands from '@/modules/heatmaps/components/ScrollBands';
import { useSnapshot } from '@/modules/heatmaps/hooks/use-snapshot';
import { useWidth } from '@/modules/heatmaps/hooks/use-width';
import { paintHeat } from '@/modules/heatmaps/utils/paint-heat';

export interface PickedElement{
    selector: string;
    label: string;
    count: number;
}

interface HeatFrameProps{
    projectId: string;
    host: string;
    heatmap: Heatmap;
    picked: PickedElement | null;
}

const locate = (frame: HTMLIFrameElement | null, selector: string | undefined): OutlineBox | null => {
    if(!frame || !selector) return null;
    try{
        const rect = frame.contentDocument?.querySelector(selector)?.getBoundingClientRect();
        return rect && rect.width && rect.height ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height } : null;
    }catch{
        return null;
    }
};

const HeatFrame = ({ projectId, host, heatmap, picked }: HeatFrameProps) => {
    const [columnRef, columnWidth] = useWidth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const width = heatmap.viewportWidth;
    const height = Math.max(heatmap.documentHeight, Math.round(width * 0.625));
    const scale = columnWidth ? Math.min(1, Math.round((columnWidth / width) * 1000) / 1000) : 0;
    const radius = Math.round(Math.min(64, 22 / Math.max(scale, 0.34)));
    const { setRoot, frame, failed } = useSnapshot(projectId, heatmap.snapshot, width, height);
    const box = useMemo(() => locate(frame, picked?.selector), [frame, picked?.selector]);
    const scroll = heatmap.mode === 'scroll';

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas || scroll || !scale) return;
        paintHeat(canvas, heatmap.points.map((point) => ({ x: point.x * width, y: point.y, weight: point.weight })), width, height, radius);
    }, [heatmap.points, scroll, scale, width, height, radius]);

    const caption = heatmap.snapshot === null
        ? 'Aún no hay una grabación de esta página para dibujarla'
        : failed ? 'No se pudo reconstruir la grabación de esta página' : null;

    return (
        <div className='min-w-0 overflow-hidden border border-separator'>
            <div className='flex h-8 items-center justify-center border-b border-separator px-3'>
                <span className='truncate text-[0.75rem] text-label-2'>
                    {host}
                    <span className='text-foreground'>{heatmap.path}</span>
                </span>
            </div>
            {caption ? <p className='border-b border-separator px-4 py-2.5 text-[0.8125rem] text-label-2'>{caption}</p> : null}
            <div ref={columnRef} className='w-full select-none'>
                <div className='relative mx-auto overflow-hidden' style={{ width: width * scale, height: height * scale }}>
                    <div className='absolute left-0 top-0 origin-top-left' style={{ width, height, transform: `scale(${scale})` }}>
                        {frame ? null : <PageSilhouette height={height} />}
                        {heatmap.snapshot ? <div ref={setRoot} className='absolute inset-0 overflow-hidden' /> : null}
                        <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 ${scroll ? 'hidden' : ''}`} style={{ width, height }} />
                    </div>
                    {scroll ? <ScrollBands reach={heatmap.reach} height={height * scale} /> : null}
                    {!scroll && picked && box ? (
                        <ElementOutline label={picked.label} count={picked.count} box={{ x: box.x * scale, y: box.y * scale, width: box.width * scale, height: box.height * scale }} />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default HeatFrame;
