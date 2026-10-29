import { ComboBox } from '@carbon/react';
import { Group } from '@/modules/projects/components/SettingsRows';
import { projectsApi } from '@/modules/projects/api/api';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';
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
        <Group title='Conversión' status={status} error={error} note='Una sesión cuenta como convertida cuando envía este evento. Elige uno de los vistos en 90 días o escribe otro; vacío, ninguna se marca.'>
            <ComboBox
                id='conversion-event'
                titleText='Evento que marca la conversión'
                size='md'
                placeholder='Ninguno'
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
