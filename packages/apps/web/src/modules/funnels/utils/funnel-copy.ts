import { Device } from '@condor/contracts/shared/analytics';
import { copy } from '@/modules/funnels/i18n';
import type { Choice } from '@/shared/components/Segmented';
import { intlLocale } from '@/shared/i18n/locale';
import { fmt } from '@/shared/utils/format';

const WINDOWS: Choice<string>[] = [
    { value: '1', label: copy.windows.hours(1) },
    { value: '24', label: copy.windows.days(1) },
    { value: '168', label: copy.windows.days(7) },
    { value: '720', label: copy.windows.days(30) }
];

const points = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 1, signDisplay: 'exceptZero' });

const days = new Intl.NumberFormat(intlLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const windowChoices = (hours: number): Choice<string>[] =>
    WINDOWS.some((choice) => choice.value === String(hours))
        ? WINDOWS
        : [...WINDOWS, { value: String(hours), label: copy.windows.hours(hours) }].sort((a, b) => Number(a.value) - Number(b.value));

export const WINDOW_OPTIONS = WINDOWS;

export const DEVICES: Record<Device, string> = copy.devices;

export const median = (seconds: number | null): string => {
    if(seconds === null) return '—';
    if(seconds >= 86_400) return copy.days(days.format(seconds / 86_400));
    return fmt.duration(seconds);
};

export const pointsDelta = (current: number, previous: number): string => {
    const delta = (current - previous) * 100;
    if(Math.abs(delta) < 0.05) return copy.sameAsBefore;
    return copy.pointsVsBefore(points.format(delta));
};
