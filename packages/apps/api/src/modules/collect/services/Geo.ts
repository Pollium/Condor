import maxmind, { CityResponse, Reader } from 'maxmind';
import { IncomingHttpHeaders } from 'node:http';

export interface GeoLocation{
    country: string | null;
    region: string | null;
    city: string | null;
}

interface Names{
    en: string;
    es?: string;
}

const UNKNOWN: GeoLocation = { country: null, region: null, city: null };
const COUNTRY_HEADERS = ['cf-ipcountry', 'x-vercel-ip-country', 'x-geo-country'];
const UNKNOWN_COUNTRIES = new Set(['XX', 'T1']);
const COUNTRY_PATTERN = /^[A-Z]{2}$/;

const headerOf = (headers: IncomingHttpHeaders, name: string): string | null => {
    const raw = headers[name];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
    return value === undefined || value === '' ? null : value;
};

const urlDecoded = (value: string | null): string | null => {
    if(value === null) return null;

    try{
        return decodeURIComponent(value);
    }catch{
        return value;
    }
};

const countryOf = (value: string | null): string | null => {
    const code = value?.toUpperCase() ?? '';
    return COUNTRY_PATTERN.test(code) && !UNKNOWN_COUNTRIES.has(code) ? code : null;
};

const nameOf = (names: Names | undefined): string | null => names?.es ?? names?.en ?? null;

export const geoFromHeaders = (headers: IncomingHttpHeaders): GeoLocation => ({
    country: COUNTRY_HEADERS.map((name) => countryOf(headerOf(headers, name))).find((code) => code !== null) ?? null,
    region: urlDecoded(headerOf(headers, 'x-geo-region')),
    city: urlDecoded(headerOf(headers, 'x-vercel-ip-city')) ?? urlDecoded(headerOf(headers, 'x-geo-city'))
});

export const geoFromCity = (found: CityResponse | null): GeoLocation => ({
    country: found?.country?.iso_code ?? null,
    region: nameOf(found?.subdivisions?.[0]?.names),
    city: nameOf(found?.city?.names)
});

export default class GeoService{
    #database: string | null;
    #trustHeaders: boolean;
    #reader?: Promise<Reader<CityResponse>>;

    constructor(database: string | null, trustHeaders: boolean){
        this.#database = database;
        this.#trustHeaders = trustHeaders;
    }

    async locate(ip: string, headers: IncomingHttpHeaders): Promise<GeoLocation>{
        if(this.#database !== null){
            this.#reader ??= maxmind.open<CityResponse>(this.#database);
            return geoFromCity((await this.#reader).get(ip));
        }

        return this.#trustHeaders ? geoFromHeaders(headers) : UNKNOWN;
    }
}
