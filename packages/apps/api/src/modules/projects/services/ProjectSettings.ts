import ValidationError from '@readable/errors/Validation';
import { ProjectSettings } from '@condor/contracts/projects/domain';
import { UpdateSettingsInput } from '@condor/contracts/projects/http';

const DEFAULT_TIMEZONE = 'UTC';
const TIMEZONES = new Set([...Intl.supportedValuesOf('timeZone'), DEFAULT_TIMEZONE]);
const ROUTE_GROUP_ROOT = '/';

export const DEFAULT_SETTINGS: ProjectSettings = {
    recordingEnabled: true,
    sampleRate: 100,
    maskInputs: true,
    maskText: false,
    blockSelector: '',
    respectDnt: false,
    captureConsole: true,
    captureNetwork: true,
    retentionDays: 90,
    routeGroups: [],
    conversionEvent: null,
    timezone: DEFAULT_TIMEZONE
};

export default class ProjectSettingsService{
    defaults(timezone: string = DEFAULT_TIMEZONE): ProjectSettings{
        this.#assertTimezone(timezone);

        return { ...DEFAULT_SETTINGS, timezone };
    }

    apply(current: ProjectSettings, input: UpdateSettingsInput): ProjectSettings{
        if(input.timezone !== undefined) this.#assertTimezone(input.timezone);
        if(input.routeGroups?.some((pattern) => !pattern.startsWith(ROUTE_GROUP_ROOT))){
            throw new ValidationError({ routeGroups: `Every pattern must start with ${ROUTE_GROUP_ROOT}` });
        }

        return { ...current, ...input };
    }

    #assertTimezone(timezone: string){
        if(!TIMEZONES.has(timezone)) throw new ValidationError({ timezone: 'Unknown timezone' });
    }
}
