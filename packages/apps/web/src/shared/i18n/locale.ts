import { Locale } from '@condor/ui/contracts/locale';
import { regionalLocale, resolveLocale } from '@condor/ui/utils/session/locale';

const REGIONS: Record<Locale, string> = { es: 'es-CL', en: 'en-US', pt: 'pt-BR' };

export const locale = resolveLocale();

export const intlLocale = regionalLocale(locale, REGIONS[locale]);

export const pick = <T>(copies: Record<Locale, T>): T => copies[locale];
