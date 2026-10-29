import BlurInput from '@/modules/projects/components/BlurInput';
import { Group, SwitchRow } from '@/modules/projects/components/SettingsRows';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';

const PrivacyGroup = ({ disabled }: { disabled: boolean }) => {
    const { settings: current } = useProject();
    const { status, error, settings } = useSaveProject();

    return (
        <Group title='Privacidad' status={status} error={error} note='Lo oculto se ve en la reproducción como un bloque vacío del mismo tamaño. Con «No rastrear» activo en el navegador no se envía nada.'>
            <SwitchRow label='Ocultar lo que se escribe' toggled={current.maskInputs} disabled={disabled} onToggle={(maskInputs) => settings({ maskInputs })} />
            <SwitchRow label='Ocultar todo el texto' toggled={current.maskText} disabled={disabled} onToggle={(maskText) => settings({ maskText })} />
            <SwitchRow label='Respetar «No rastrear»' toggled={current.respectDnt} disabled={disabled} onToggle={(respectDnt) => settings({ respectDnt })} />
            <BlurInput
                id='block-selector'
                label='Nunca grabar estos elementos'
                placeholder='[data-private], .card-number'
                value={current.blockSelector}
                disabled={disabled}
                mono
                onSave={(blockSelector) => settings({ blockSelector })}
            />
        </Group>
    );
};

export default PrivacyGroup;
