import { Button, Dropdown, InlineNotification, Modal, TextInput } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { Funnel } from '@condor/contracts/funnels/domain';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { funnelsApi } from '@/modules/funnels/api/api';
import FunnelStepField, { type StepDraft } from '@/modules/funnels/components/FunnelStepField';
import { useKnownTargets } from '@/modules/funnels/hooks/use-known-targets';
import { windowChoices } from '@/modules/funnels/utils/funnel-copy';
import { translate } from '@/shared/utils/carbon-translate';
import { errorCopy } from '@/shared/utils/error-copy';

const MIN_STEPS = 2;
const MAX_STEPS = 8;

const blank = (kind: StepDraft['kind']): StepDraft => ({ key: crypto.randomUUID(), kind, match: '', label: '' });

const draftsOf = (funnel: Funnel | null): StepDraft[] =>
    funnel ? funnel.steps.map((step) => ({ ...step, key: crypto.randomUUID() })) : [blank('page'), blank('event')];

const copy = errorCopy({ 'Funnel::NotFound': 'Este embudo ya no existe.' });

interface FunnelEditorProps{
    projectId: string;
    funnel: Funnel | null;
    onClose: () => void;
    onSaved: (funnel: Funnel) => void;
}

const FunnelEditor = ({ projectId, funnel, onClose, onSaved }: FunnelEditorProps) => {
    const [name, setName] = useState(funnel?.name ?? '');
    const [hours, setHours] = useState(String(funnel?.windowHours ?? 24));
    const [drafts, setDrafts] = useState(() => draftsOf(funnel));
    const known = useKnownTargets(projectId);
    const create = useMutation(funnelsApi.create);
    const update = useMutation(funnelsApi.update);
    const saving = create.loading || update.loading;
    const error = copy(create.error ?? update.error);
    const choices = windowChoices(Number(hours));
    const valid = name.trim() !== '' && drafts.length >= MIN_STEPS && drafts.every((draft) => draft.match.trim() !== '');

    const change = (key: string, patch: Partial<StepDraft>) =>
        setDrafts((current) => current.map((draft) => (draft.key === key ? { ...draft, ...patch } : draft)));

    const submit = () => {
        if(!valid || saving) return;
        const body = {
            name: name.trim(),
            windowHours: Number(hours),
            steps: drafts.map((draft) => ({
                kind: draft.kind,
                match: draft.match.trim(),
                label: (draft.label.trim() || draft.match.trim()).slice(0, 80)
            }))
        };
        const saved = funnel ? update.run(projectId, funnel.id, body) : create.run(projectId, body);
        saved.then(onSaved, () => undefined);
    };

    return createPortal(
        <Modal
            open
            size='md'
            modalHeading={funnel ? 'Editar embudo' : 'Nuevo embudo'}
            primaryButtonText={saving ? 'Guardando…' : 'Guardar'}
            secondaryButtonText='Cancelar'
            primaryButtonDisabled={!valid || saving}
            closeButtonLabel='Cerrar'
            preventCloseOnClickOutside
            selectorPrimaryFocus='#funnel-name'
            onRequestClose={onClose}
            onRequestSubmit={submit}
        >
            <div className='flex flex-col gap-6'>
                <p className='text-[0.875rem] text-label-2'>
                    Cuenta a las personas que hacen cada paso en orden, dentro de la ventana desde el primero.
                </p>
                <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]'>
                    <TextInput
                        id='funnel-name'
                        labelText='Nombre'
                        placeholder='Compra'
                        maxLength={80}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Dropdown
                        id='funnel-window'
                        titleText='Ventana de conversión'
                        label='Ventana de conversión'
                        items={choices}
                        itemToString={(choice) => choice?.label ?? ''}
                        selectedItem={choices.find((choice) => choice.value === hours) ?? null}
                        onChange={({ selectedItem }) => selectedItem && setHours(selectedItem.value)}
                        translateWithId={translate}
                    />
                </div>
                <div className='flex flex-col gap-4'>
                    {drafts.map((draft, index) => (
                        <FunnelStepField
                            key={draft.key}
                            draft={draft}
                            index={index}
                            known={known[draft.kind]}
                            removable={drafts.length > MIN_STEPS}
                            onChange={(patch) => change(draft.key, patch)}
                            onRemove={() => setDrafts((current) => current.filter((entry) => entry.key !== draft.key))}
                        />
                    ))}
                </div>
                <div>
                    <Button
                        kind='ghost'
                        size='sm'
                        renderIcon={Add}
                        disabled={drafts.length >= MAX_STEPS}
                        onClick={() => setDrafts((current) => [...current, blank('event')])}
                    >
                        {drafts.length >= MAX_STEPS ? 'Hasta 8 pasos' : 'Añadir paso'}
                    </Button>
                </div>
                {error ? <InlineNotification kind='error' lowContrast hideCloseButton title={error} /> : null}
            </div>
        </Modal>,
        document.body
    );
};

export default FunnelEditor;
