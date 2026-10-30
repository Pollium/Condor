import { Locale, LOCALES } from '../../contracts/locale';

const STORAGE_KEY = 'condor.locale';
const QUERY_KEY = 'lang';

const isLocale = (value: string | null | undefined): value is Locale => LOCALES.includes(value as Locale);

const stored = (): string | null => {
    try{
        return localStorage.getItem(STORAGE_KEY);
    }catch{
        return null;
    }
};

const spoken = (): readonly string[] => navigator.languages.length > 0 ? navigator.languages : [navigator.language];

export const resolveLocale = (): Locale => {
    const fromQuery = new URLSearchParams(window.location.search).get(QUERY_KEY);
    if(isLocale(fromQuery)) return fromQuery;

    const saved = stored();
    if(isLocale(saved)) return saved;

    return spoken().map((tag) => tag.slice(0, 2).toLowerCase()).find(isLocale) ?? 'en';
};

export const regionalLocale = (locale: Locale, fallback: string): string =>
    spoken().find((tag) => tag.toLowerCase().startsWith(`${locale}-`)) ?? fallback;

export const switchLocale = (locale: Locale) => {
    try{
        localStorage.setItem(STORAGE_KEY, locale);
    }catch{
        return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete(QUERY_KEY);
    window.location.replace(url);
};

export const initLocale = () => {
    document.documentElement.lang = resolveLocale();
};
