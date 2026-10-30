import { Slider } from '@carbon/react';
import { Group, Row, SwitchRow } from '@/modules/projects/components/SettingsRows';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { useEffect, useRef, useState } from 'react';

const RETENTION = [30, 90, 180, 365, 730].map((days) => ({ value: String(days), label: days < 365 ? copy.recording.days(days) : copy.recording.years(days / 365) }));

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
        : [...RETENTION, { value: String(current.retentionDays), label: copy.recording.days(current.retentionDays) }];

    return (
        <Group title={copy.recording.title} status={status} error={error} note={copy.recording.note}>
            <SwitchRow label={copy.recording.enabled} toggled={current.recordingEnabled} disabled={disabled} onToggle={(recordingEnabled) => settings({ recordingEnabled })} />
            <Row label={copy.recording.sample}>
                <Slider
                    labelText={copy.recording.sample}
                    hideLabel
                    hideTextInput
                    value={sample}
                    onChange={({ value }) => setSample(value)}
                    min={0}
                    max={100}
                    step={1}
                    disabled={disabled || !current.recordingEnabled}
                    formatLabel={(value) => copy.recording.percent(value)}
                    className='slider-bare w-40'
                />
                <span className='w-12 whitespace-nowrap text-right text-[0.875rem] tabular-nums text-label-2'>{copy.recording.percent(sample)}</span>
            </Row>
            <Row label={copy.recording.keepFor}>
                {disabled ? (
                    <span className='text-[0.875rem] text-label-2'>{choices.find((entry) => entry.value === String(current.retentionDays))?.label}</span>
                ) : (
                    <ToolbarMenu label={copy.recording.keepFor} choices={choices} value={String(current.retentionDays)} onChange={(value) => settings({ retentionDays: Number(value) })} className='-mr-2' />
                )}
            </Row>
        </Group>
    );
};

export default RecordingGroup;
