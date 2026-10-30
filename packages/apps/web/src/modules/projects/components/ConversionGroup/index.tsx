import { ComboBox } from '@carbon/react';
import { Group } from '@/modules/projects/components/SettingsRows';
import { projectsApi } from '@/modules/projects/api/api';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { translate } from '@/shared/utils/carbon-translate';
import { useQuery } from '@condor/ui/hooks/api/use-query';

const ConversionGroup = ({ disabled }: { disabled: boolean }) => {
    const project = useProject();
    const current = project.settings.conversionEvent;
    const { status, error, settings } = useSaveProject();
    const events = useQuery(projectsApi.events, [project.id], { select: (breakdown) => breakdown.slices.map((slice) => slice.label) });
    const items = events.data ?? [];

    const commit = (value: string | null | undefined) => {
        const next = value?.trim() || null;
        if(next !== current) void settings({ conversionEvent: next });
    };

    return (
        <Group title={copy.conversion.title} status={status} error={error} note={copy.conversion.note}>
            <ComboBox
                id='conversion-event'
                titleText={copy.conversion.event}
                size='md'
                placeholder={copy.conversion.none}
                items={current !== null && !items.includes(current) ? [current, ...items] : items}
                selectedItem={current}
                allowCustomValue
                disabled={disabled}
                onChange={({ selectedItem, inputValue }) => commit(selectedItem ?? inputValue)}
                translateWithId={translate}
                className='pt-2 [&_input]:font-mono'
            />
        </Group>
    );
};

export default ConversionGroup;
