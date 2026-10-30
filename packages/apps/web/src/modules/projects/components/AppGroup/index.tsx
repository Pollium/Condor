import { ComboBox } from '@carbon/react';
import BlurInput from '@/modules/projects/components/BlurInput';
import { Group, Row } from '@/modules/projects/components/SettingsRows';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { TIMEZONES, TINTS } from '@/modules/projects/utils/tints';
import { translate } from '@/shared/utils/carbon-translate';

const AppGroup = ({ disabled }: { disabled: boolean }) => {
    const project = useProject();
    const { status, error, settings, details } = useSaveProject();

    return (
        <Group title={copy.app.title} status={status} error={error} note={copy.app.note}>
            <div className='grid gap-x-6 sm:grid-cols-2'>
                <BlurInput id='app-name' label={copy.app.name} value={project.name} disabled={disabled} required onSave={(name) => details({ name })} />
                <BlurInput id='app-host' label={copy.app.domain} value={project.host} disabled={disabled} required mono onSave={(host) => details({ host })} />
            </div>
            <Row label={copy.app.color}>
                <div role='radiogroup' aria-label={copy.app.color} className='flex flex-wrap gap-1.5'>
                    {TINTS.map((tint) => (
                        <button
                            key={tint}
                            type='button'
                            role='radio'
                            aria-checked={project.tint === tint}
                            aria-label={tint}
                            disabled={disabled}
                            onClick={() => project.tint !== tint && details({ tint })}
                            className={`h-6 w-6 outline-offset-2 disabled:cursor-not-allowed ${project.tint === tint ? 'outline-2 outline-foreground' : ''}`}
                            style={{ background: tint }}
                        />
                    ))}
                </div>
            </Row>
            <ComboBox
                id='app-timezone'
                titleText={copy.app.timezone}
                size='md'
                items={TIMEZONES}
                selectedItem={project.settings.timezone}
                disabled={disabled}
                onChange={({ selectedItem }) => selectedItem && selectedItem !== project.settings.timezone && settings({ timezone: selectedItem })}
                translateWithId={translate}
                className='pt-2'
            />
        </Group>
    );
};

export default AppGroup;
