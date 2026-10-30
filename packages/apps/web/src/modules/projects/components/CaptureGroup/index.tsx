import { Group, SwitchRow } from '@/modules/projects/components/SettingsRows';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';

const CaptureGroup = ({ disabled }: { disabled: boolean }) => {
    const { settings: current } = useProject();
    const { status, error, settings } = useSaveProject();

    return (
        <Group title={copy.capture.title} status={status} error={error} note={copy.capture.note}>
            <SwitchRow label={copy.capture.network} toggled={current.captureNetwork} disabled={disabled} onToggle={(captureNetwork) => settings({ captureNetwork })} />
            <SwitchRow label={copy.capture.console} toggled={current.captureConsole} disabled={disabled} onToggle={(captureConsole) => settings({ captureConsole })} />
        </Group>
    );
};

export default CaptureGroup;
