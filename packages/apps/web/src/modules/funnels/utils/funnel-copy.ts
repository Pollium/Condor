import { Device } from '@condor/contracts/shared/analytics';
import type { Choice } from '@/shared/components/Segmented';
import { fmt } from '@/shared/utils/format';

const WINDOWS: Choice<string>[] = [
    { value: '1', label: 'En 1 h' },
    { value: '24', label: 'En 1 día' },
    { value: '168', label: 'En 7 días' },
    { value: '720', label: 'En 30 días' }
];

const points = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1, signDisplay: 'exceptZero' });

export const windowChoices = (hours: number): Choice<string>[] =>
    WINDOWS.some((choice) => choice.value === String(hours))
        ? WINDOWS
        : [...WINDOWS, { value: String(hours), label: `En ${hours} h` }].sort((a, b) => Number(a.value) - Number(b.value));

export const WINDOW_OPTIONS = WINDOWS;

export const DEVICES: Record<Device, string> = {
    desktop: 'Escritorio',
    mobile: 'Móvil',
    tablet: 'Tableta'
};

export const median = (seconds: number | null): string => {
    if(seconds === null) return '—';
    if(seconds >= 86_400) return `${(seconds / 86_400).toFixed(1).replace('.', ',')} días`;
    return fmt.duration(seconds);
};

export const pointsDelta = (current: number, previous: number): string => {
    const delta = (current - previous) * 100;
    if(Math.abs(delta) < 0.05) return 'Igual que antes';
    return `${points.format(delta)} pts vs. antes`;
};
