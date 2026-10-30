import { ComboBox, IconButton, TextInput } from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';
import { FunnelStepKind } from '@condor/contracts/funnels/domain';
import { copy } from '@/modules/funnels/i18n';
import Segmented, { type Choice } from '@/shared/components/Segmented';
import { translate } from '@/shared/utils/carbon-translate';

export interface StepDraft{
    key: string;
    kind: FunnelStepKind;
    match: string;
    label: string;
    whereKey: string;
    whereValue: string;
}

const KINDS: Choice<FunnelStepKind>[] = [
    { value: 'page', label: copy.stepField.kinds.page },
    { value: 'event', label: copy.stepField.kinds.event }
];

interface FunnelStepFieldProps{
    draft: StepDraft;
    index: number;
    known: string[];
    removable: boolean;
    onChange: (patch: Partial<StepDraft>) => void;
    onRemove: () => void;
}

const matches = ({ item, inputValue }: { item: string; inputValue: string | null }) =>
    !inputValue || item.toLowerCase().includes(inputValue.toLowerCase());

const FunnelStepField = ({ draft, index, known, removable, onChange, onRemove }: FunnelStepFieldProps) => (
    <fieldset className='flex flex-col gap-3 border-t border-separator pt-4'>
        <legend className='sr-only'>{copy.stepField.step(index + 1)}</legend>
        <div className='flex items-center gap-3'>
            <span className='flex-1 text-[0.875rem] text-foreground'>{copy.stepField.step(index + 1)}</span>
            <Segmented label={copy.stepField.kindOf(index + 1)} choices={KINDS} value={draft.kind} onChange={(kind) => onChange({ kind, match: '', whereKey: '', whereValue: '' })} />
            <IconButton kind='ghost' size='sm' label={copy.stepField.remove} align='left' disabled={!removable} onClick={onRemove}>
                <TrashCan />
            </IconButton>
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
            <ComboBox
                key={`${draft.key}-${draft.kind}`}
                id={`step-${draft.key}-match`}
                titleText={copy.stepField.kinds[draft.kind]}
                helperText={draft.kind === 'page' ? copy.stepField.pageHelper : copy.stepField.eventHelper}
                placeholder={draft.kind === 'page' ? copy.stepField.pagePlaceholder : 'add_to_cart'}
                items={known}
                initialSelectedItem={draft.match || undefined}
                shouldFilterItem={matches}
                allowCustomValue
                autoAlign
                onChange={({ selectedItem }) => selectedItem && onChange({ match: selectedItem })}
                onInputChange={(text) => onChange({ match: text })}
                translateWithId={translate}
            />
            <TextInput
                id={`step-${draft.key}-label`}
                labelText={copy.stepField.label}
                helperText={copy.stepField.labelHelper}
                placeholder={draft.match || copy.stepField.labelPlaceholder}
                maxLength={80}
                value={draft.label}
                onChange={(event) => onChange({ label: event.target.value })}
            />
        </div>
        {draft.kind === 'event' ? (
            <div className='grid gap-3 sm:grid-cols-2'>
                <TextInput
                    id={`step-${draft.key}-where-key`}
                    labelText={copy.stepField.whereKey}
                    helperText={copy.stepField.whereKeyHelper}
                    placeholder='plan'
                    maxLength={64}
                    value={draft.whereKey}
                    onChange={(event) => onChange({ whereKey: event.target.value })}
                />
                <TextInput
                    id={`step-${draft.key}-where-value`}
                    labelText={copy.stepField.whereValue}
                    helperText={copy.stepField.whereValueHelper}
                    placeholder='pro'
                    maxLength={256}
                    value={draft.whereValue}
                    onChange={(event) => onChange({ whereValue: event.target.value })}
                />
            </div>
        ) : null}
    </fieldset>
);

export default FunnelStepField;
