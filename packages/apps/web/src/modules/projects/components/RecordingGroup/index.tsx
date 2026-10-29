import { Slider } from '@carbon/react';
import { Group, Row, SwitchRow } from '@/modules/projects/components/SettingsRows';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { useEffect, useRef, useState } from 'react';

const RETENTION = [30, 90, 180, 365, 730].map((days) => ({ value: String(days), label: days < 365 ? `${days} días` : `${days / 365} ${days === 365 ? 'año' : 'años'}` }));

const RecordingGroup = ({ disabled }: { disabled: boolean }) => {
    const { settings: current } = useProject();
    const { status, error, settings } = useSaveProject();
    const [sample, setSample] = useState(current.sampleRate);
    const [synced, setSynced] = useState(current.sampleRate);
    if(synced !== current.sampleRate){
        setSynced(current.sampleRate);
        setSample(current.sampleRate);
    }

    const save = useRef(settings);
    useEffect(() => {
        save.current = settings;
    });

    useEffect(() => {
        if(sample === current.sampleRate) return;
        const timer = window.setTimeout(() => save.current({ sampleRate: sample }), 600);
        return () => window.clearTimeout(timer);
    }, [sample, current.sampleRate]);

    const choices = RETENTION.some((entry) => entry.value === String(current.retentionDays))
        ? RETENTION
        : [...RETENTION, { value: String(current.retentionDays), label: `${current.retentionDays} días` }];

    return (
        <Group title='Grabación' status={status} error={error} note='Las métricas cuentan todas las sesiones; solo las grabaciones siguen la muestra. Al vencer el plazo se borran eventos y grabaciones.'>
            <SwitchRow label='Grabar sesiones' toggled={current.recordingEnabled} disabled={disabled} onToggle={(recordingEnabled) => settings({ recordingEnabled })} />
            <Row label='Sesiones que se graban'>
                <Slider
                    labelText='Sesiones que se graban'
                    hideLabel
                    hideTextInput
                    value={sample}
                    onChange={({ value }) => setSample(value)}
                    min={0}
                    max={100}
                    step={1}
                    disabled={disabled || !current.recordingEnabled}
                    formatLabel={(value) => `${value} %`}
                    className='slider-bare w-40'
                />
                <span className='w-12 whitespace-nowrap text-right text-[0.875rem] tabular-nums text-label-2'>{sample} %</span>
            </Row>
            <Row label='Guardar durante'>
                {disabled ? (
                    <span className='text-[0.875rem] text-label-2'>{choices.find((entry) => entry.value === String(current.retentionDays))?.label}</span>
                ) : (
                    <ToolbarMenu label='Guardar durante' choices={choices} value={String(current.retentionDays)} onChange={(value) => settings({ retentionDays: Number(value) })} className='-mr-2' />
                )}
            </Row>
        </Group>
    );
};

export default RecordingGroup;
