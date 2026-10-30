import { PlayFilledAlt, Restart } from '@carbon/icons-react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { Player } from '@/modules/sessions/hooks/use-replayer';
import { copy } from '@/modules/sessions/i18n';

interface ReplayStageProps{
    player: Player;
    address: string | null;
    fit?: number;
}

const useWidth = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    useLayoutEffect(() => {
        const element = ref.current;
        if(!element) return;
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    return [ref, width] as const;
};

const ReplayStage = ({ player, address, fit = 0.62 }: ReplayStageProps) => {
    const [ref, width] = useWidth();
    const { mount, viewport, playing, skipping, toggle, time, total } = player;
    const { width: frameWidth, height: frameHeight } = viewport;
    const scale = width ? Math.min(width / frameWidth, (window.innerHeight * fit) / frameHeight) : 0;
    const ended = total > 0 && time >= total;

    return (
        <div className='overflow-hidden border border-separator'>
            <div className='flex h-8 items-center justify-center border-b border-separator px-3'>
                <span className='truncate text-[0.75rem] text-label-2'>{address ?? ' '}</span>
            </div>
            <div ref={ref} className='relative w-full select-none bg-foreground/[0.03]' style={{ height: frameHeight * scale || 240 }}>
                <div
                    ref={mount}
                    className='pointer-events-none absolute top-0 origin-top-left [&_iframe]:border-0 [&_iframe]:bg-white'
                    style={{ width: frameWidth, height: frameHeight, left: Math.max(0, (width - frameWidth * scale) / 2), transform: `scale(${scale})` }}
                />
                <button
                    type='button'
                    aria-label={playing ? copy.controls.pause : copy.controls.play}
                    onClick={toggle}
                    className='absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--cds-focus)]'
                />
                {skipping ? (
                    <div className='pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap bg-overlay px-4 py-2 text-[0.8125rem] text-foreground shadow-[var(--overlay-shadow)]'>
                        {copy.replay.skipping}
                    </div>
                ) : null}
                {!playing ? (
                    <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                        <span className='flex size-14 items-center justify-center bg-overlay text-foreground shadow-[var(--overlay-shadow)]'>
                            {ended ? <Restart size={20} /> : <PlayFilledAlt size={20} />}
                        </span>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default ReplayStage;
