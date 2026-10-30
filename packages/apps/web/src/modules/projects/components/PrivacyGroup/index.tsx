import BlurInput from '@/modules/projects/components/BlurInput';
import { Group, SwitchRow } from '@/modules/projects/components/SettingsRows';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';

const PrivacyGroup = ({ disabled }: { disabled: boolean }) => {
    const { settings: current } = useProject();
    const { status, error, settings } = useSaveProject();

    return (
        <Group title={copy.privacy.title} status={status} error={error} note={copy.privacy.note}>
            <SwitchRow label={copy.privacy.maskInputs} toggled={current.maskInputs} disabled={disabled} onToggle={(maskInputs) => settings({ maskInputs })} />
            <SwitchRow label={copy.privacy.maskText} toggled={current.maskText} disabled={disabled} onToggle={(maskText) => settings({ maskText })} />
            <SwitchRow label={copy.privacy.respectDnt} toggled={current.respectDnt} disabled={disabled} onToggle={(respectDnt) => settings({ respectDnt })} />
            <BlurInput
                id='block-selector'
                label={copy.privacy.blockSelector}
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
