import { ComboBox, IconButton, TextInput } from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';
import { FunnelStepKind } from '@condor/contracts/funnels/domain';
import Segmented, { type Choice } from '@/shared/components/Segmented';
import { translate } from '@/shared/utils/carbon-translate';

export interface StepDraft{
    key: string;
    kind: FunnelStepKind;
    match: string;
    label: string;
}

const KINDS: Choice<FunnelStepKind>[] = [
    { value: 'page', label: 'Página' },
    { value: 'event', label: 'Evento' }
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
        <legend className='sr-only'>Paso {index + 1}</legend>
        <div className='flex items-center gap-3'>
            <span className='flex-1 text-[0.875rem] text-foreground'>Paso {index + 1}</span>
            <Segmented label={`Tipo del paso ${index + 1}`} choices={KINDS} value={draft.kind} onChange={(kind) => onChange({ kind, match: '' })} />
            <IconButton kind='ghost' size='sm' label='Quitar paso' align='left' disabled={!removable} onClick={onRemove}>
                <TrashCan />
            </IconButton>
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
            <ComboBox
                key={`${draft.key}-${draft.kind}`}
                id={`step-${draft.key}-match`}
                titleText={draft.kind === 'page' ? 'Página' : 'Evento'}
                helperText={draft.kind === 'page' ? 'Una ruta; :parámetro vale cualquier valor' : 'El nombre que envía tu app'}
                placeholder={draft.kind === 'page' ? '/productos/:slug' : 'add_to_cart'}
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
                labelText='Nombre del paso'
                helperText='Opcional; si lo dejas vacío se usa la página o el evento'
                placeholder={draft.match || 'Ve un producto'}
                maxLength={80}
                value={draft.label}
                onChange={(event) => onChange({ label: event.target.value })}
            />
        </div>
    </fieldset>
);

export default FunnelStepField;
