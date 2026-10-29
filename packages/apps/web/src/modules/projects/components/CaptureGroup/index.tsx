import { Group, SwitchRow } from '@/modules/projects/components/SettingsRows';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';

const CaptureGroup = ({ disabled }: { disabled: boolean }) => {
    const { settings: current } = useProject();
    const { status, error, settings } = useSaveProject();

    return (
        <Group title='Red y consola' status={status} error={error} note='Authorization y Cookie nunca se guardan. Las peticiones y la consola aparecen junto a la reproducción.'>
            <SwitchRow label='Capturar las peticiones de red' toggled={current.captureNetwork} disabled={disabled} onToggle={(captureNetwork) => settings({ captureNetwork })} />
            <SwitchRow label='Capturar la consola' toggled={current.captureConsole} disabled={disabled} onToggle={(captureConsole) => settings({ captureConsole })} />
        </Group>
    );
};

export default CaptureGroup;
