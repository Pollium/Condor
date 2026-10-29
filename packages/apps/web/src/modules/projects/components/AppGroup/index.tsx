import { ComboBox } from '@carbon/react';
import BlurInput from '@/modules/projects/components/BlurInput';
import { Group, Row } from '@/modules/projects/components/SettingsRows';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { TIMEZONES, TINTS } from '@/modules/projects/utils/tints';
import { translate } from '@/shared/utils/carbon-translate';

const AppGroup = ({ disabled }: { disabled: boolean }) => {
    const project = useProject();
    const { status, error, settings, details } = useSaveProject();

    return (
        <Group title='App' status={status} error={error} note='La zona horaria decide dónde empieza cada día en los gráficos y en el estado de abajo.'>
            <div className='grid gap-x-6 sm:grid-cols-2'>
                <BlurInput id='app-name' label='Nombre' value={project.name} disabled={disabled} required onSave={(name) => details({ name })} />
                <BlurInput id='app-host' label='Dominio' value={project.host} disabled={disabled} required mono onSave={(host) => details({ host })} />
            </div>
            <Row label='Color'>
                <div role='radiogroup' aria-label='Color' className='flex flex-wrap gap-1.5'>
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
                titleText='Zona horaria'
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
