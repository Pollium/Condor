import { Dropdown, IconButton, Popover, PopoverContent, Toggle } from '@carbon/react';
import { Forward_10, PauseFilled, PlayFilledAlt, Rewind_10, SettingsAdjust } from '@carbon/icons-react';
import { useId, useState, type CSSProperties } from 'react';
import type { Player } from '@/modules/sessions/hooks/use-replayer';
import { fmt } from '@/shared/utils/format';
import { translate } from '@/shared/utils/carbon-translate';

export interface Mark{
    key: string;
    at: number;
    tone: 'danger' | 'strong' | 'soft';
}

interface ReplayControlsProps{
    player: Player;
    marks: Mark[];
}

const SPEEDS = [1, 2, 4, 8];

const TONES: Record<Mark['tone'], string> = {
    danger: 'h-2 bg-danger',
    strong: 'h-2 bg-foreground/45',
    soft: 'h-1.5 bg-foreground/20'
};

const SCRUBBER = [
    'block h-4 w-full cursor-pointer appearance-none bg-transparent focus:outline-none',
    '[&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:bg-[image:var(--track)]',
    '[&::-moz-range-track]:h-0.5 [&::-moz-range-track]:bg-[image:var(--track)]',
    '[&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground',
    '[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground',
    'focus-visible:[&::-webkit-slider-thumb]:bg-accent focus-visible:[&::-moz-range-thumb]:bg-accent'
].join(' ');

const ReplayControls = ({ player, marks }: ReplayControlsProps) => {
    const { time, total, playing, toggle, seek, speed, setSpeed, skipInactive, setSkipInactive } = player;
    const id = useId();
    const [open, setOpen] = useState(false);
    const fill = `${total ? (time / total) * 100 : 0}%`;

    return (
        <div className='flex flex-col gap-1.5'>
            <div className='relative pt-2'>
                <div aria-hidden className='pointer-events-none absolute inset-x-[7px] top-0 h-2'>
                    {total ? marks.filter((mark) => mark.at >= 0 && mark.at <= total).map((mark) => (
                        <span key={mark.key} className={`absolute top-0 w-px ${TONES[mark.tone]}`} style={{ left: `${(mark.at / total) * 100}%` }} />
                    )) : null}
                </div>
                <input
                    type='range'
                    aria-label='Posición'
                    min={0}
                    max={total}
                    step={100}
                    value={time}
                    disabled={!total}
                    onChange={(event) => seek(Number(event.target.value))}
                    className={SCRUBBER}
                    style={{ '--track': `linear-gradient(to right, var(--foreground) ${fill}, var(--separator) ${fill})` } as CSSProperties}
                />
            </div>

            <div className='flex items-center gap-1'>
                <IconButton kind='ghost' size='sm' label={playing ? 'Pausar' : 'Reproducir'} onClick={toggle} align='top-start'>
                    {playing ? <PauseFilled /> : <PlayFilledAlt />}
                </IconButton>
                <IconButton kind='ghost' size='sm' label='Retroceder 10 segundos' onClick={() => seek(time - 10_000)} align='top'>
                    <Rewind_10 />
                </IconButton>
                <IconButton kind='ghost' size='sm' label='Avanzar 10 segundos' onClick={() => seek(time + 10_000)} align='top'>
                    <Forward_10 />
                </IconButton>
                <span className='ml-2 whitespace-nowrap text-[0.8125rem] tabular-nums text-label-2'>
                    <span className='text-foreground'>{fmt.clock(time / 1000)}</span> / {fmt.clock(total / 1000)}
                </span>

                <span className='flex-1' />

                <Dropdown
                    id={`${id}-speed`}
                    type='inline'
                    size='sm'
                    direction='top'
                    titleText='Velocidad'
                    hideLabel
                    label='Velocidad'
                    items={SPEEDS}
                    itemToString={(value) => (value === null ? '' : `${value}×`)}
                    selectedItem={speed}
                    onChange={({ selectedItem }) => selectedItem && setSpeed(selectedItem)}
                    translateWithId={translate}
                    className='tabular-nums'
                />

                <Popover open={open} onRequestClose={() => setOpen(false)} align='top-end'>
                    <IconButton kind='ghost' size='sm' label='Opciones de reproducción' onClick={() => setOpen((value) => !value)} align='top-end'>
                        <SettingsAdjust />
                    </IconButton>
                    <PopoverContent>
                        <div className='flex w-64 items-center justify-between gap-4 p-4'>
                            <label id={`${id}-skip-label`} htmlFor={`${id}-skip`} className='flex cursor-pointer flex-col'>
                                <span className='text-[0.875rem] text-foreground'>Saltar la inactividad</span>
                                <span className='text-[0.75rem] text-label-2'>Pasa de largo los tramos sin movimiento</span>
                            </label>
                            <Toggle id={`${id}-skip`} aria-labelledby={`${id}-skip-label`} size='sm' hideLabel toggled={skipInactive} onToggle={setSkipInactive} />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export default ReplayControls;
