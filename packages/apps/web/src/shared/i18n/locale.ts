export type Locale = 'es' | 'en' | 'pt';

const LOCALES: readonly Locale[] = ['es', 'en', 'pt'];

const REGIONS: Record<Locale, string> = { es: 'es-CL', en: 'en-US', pt: 'pt-BR' };

const KEY = 'condor.locale';

const QUERY_KEY = 'lang';

const isLocale = (value: string | null | undefined): value is Locale => LOCALES.includes(value as Locale);

const stored = (): string | null => {
    try{
        return localStorage.getItem(KEY);
    }catch{
        return null;
    }
};

const spoken = (): readonly string[] => navigator.languages.length > 0 ? navigator.languages : [navigator.language];

const resolveLocale = (): Locale => {
    const fromQuery = new URLSearchParams(window.location.search).get(QUERY_KEY);
    if(isLocale(fromQuery)) return fromQuery;

    const saved = stored();
    if(isLocale(saved)) return saved;

    return spoken().map((tag) => tag.slice(0, 2).toLowerCase()).find(isLocale) ?? 'en';
};

export const locale = resolveLocale();

export const intlLocale = spoken().find((tag) => tag.toLowerCase().startsWith(`${locale}-`)) ?? REGIONS[locale];

export const pick = <T>(copies: Record<Locale, T>): T => copies[locale];

export const initLocale = () => {
    document.documentElement.lang = locale;
};

export const switchLocale = (next: Locale) => {
    try{
        localStorage.setItem(KEY, next);
    }catch{
        return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete(QUERY_KEY);
    window.location.replace(url);
};
