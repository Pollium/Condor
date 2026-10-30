import { Channel, Device } from '@condor/contracts/shared/analytics';
import { SessionSummary } from '@condor/contracts/sessions/domain';
import { copy } from '@/modules/sessions/i18n';
import { intlLocale } from '@/shared/i18n/locale';

export const DEVICE_LABELS: Record<Device, string> = copy.devices;

export const CHANNEL_LABELS: Record<Channel, string> = copy.channels;

const regions = new Intl.DisplayNames(intlLocale, { type: 'region' });

export const countryName = (code: string | null): string | null => {
    if(code === null) return null;
    try{
        return regions.of(code) ?? code;
    }catch{
        return code;
    }
};

type Who = Pick<SessionSummary, 'name' | 'email' | 'userId'>;

export const personName = (who: Who): string => who.name ?? who.email ?? who.userId ?? copy.anonymous;

export const initials = (who: Who): string => {
    const source = who.name ?? who.email;
    if(source === null) return '·';
    return source.split(/[\s@.]+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
};

export const place = (session: Pick<SessionSummary, 'city' | 'country'>): string | null =>
    [session.city, countryName(session.country)].filter(Boolean).join(', ') || null;

export const join = (...parts: (string | null | undefined | false)[]): string => parts.filter(Boolean).join(' · ');
