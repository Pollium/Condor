import { Button, Dropdown, InlineNotification, Modal, TextInput } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { Funnel } from '@condor/contracts/funnels/domain';
import { useMutation } from '@condor/ui/hooks/api/use-mutation';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { funnelsApi } from '@/modules/funnels/api/api';
import FunnelStepField, { type StepDraft } from '@/modules/funnels/components/FunnelStepField';
import { useKnownTargets } from '@/modules/funnels/hooks/use-known-targets';
import { copy } from '@/modules/funnels/i18n';
import { windowChoices } from '@/modules/funnels/utils/funnel-copy';
import { copy as shared } from '@/shared/i18n';
import { translate } from '@/shared/utils/carbon-translate';
import { errorCopy } from '@/shared/utils/error-copy';

const MIN_STEPS = 2;
const MAX_STEPS = 8;

const blank = (kind: StepDraft['kind']): StepDraft => ({ key: crypto.randomUUID(), kind, match: '', label: '', whereKey: '', whereValue: '' });

const draftsOf = (funnel: Funnel | null): StepDraft[] =>
    funnel
        ? funnel.steps.map((step) => ({
            key: crypto.randomUUID(),
            kind: step.kind,
            match: step.match,
            label: step.label,
            whereKey: step.where?.key ?? '',
            whereValue: step.where?.value ?? ''
        }))
        : [blank('page'), blank('event')];

const filled = (draft: StepDraft): boolean => draft.whereKey.trim() !== '' && draft.whereValue.trim() !== '';

const halfFilled = (draft: StepDraft): boolean => (draft.whereKey.trim() === '') !== (draft.whereValue.trim() === '');

const failure = errorCopy({ 'Funnel::NotFound': copy.errors.notFound });

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
    const error = failure(create.error ?? update.error);
    const choices = windowChoices(Number(hours));
    const valid = name.trim() !== '' && drafts.length >= MIN_STEPS && drafts.every((draft) => draft.match.trim() !== '' && !halfFilled(draft));

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
                label: (draft.label.trim() || draft.match.trim()).slice(0, 80),
                ...(draft.kind === 'event' && filled(draft) ? { where: { key: draft.whereKey.trim(), value: draft.whereValue.trim() } } : {})
            }))
        };
        const saved = funnel ? update.run(projectId, funnel.id, body) : create.run(projectId, body);
        saved.then(onSaved, () => undefined);
    };

    return createPortal(
        <Modal
            open
            size='md'
            modalHeading={funnel ? copy.editor.edit : copy.editor.create}
            primaryButtonText={saving ? copy.editor.saving : copy.editor.save}
            secondaryButtonText={copy.editor.cancel}
            primaryButtonDisabled={!valid || saving}
            closeButtonLabel={shared.close}
            preventCloseOnClickOutside
            selectorPrimaryFocus='#funnel-name'
            onRequestClose={onClose}
            onRequestSubmit={submit}
        >
            <div className='flex flex-col gap-6'>
                <p className='text-[0.875rem] text-label-2'>
                    {copy.editor.intro}
                </p>
                <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]'>
                    <TextInput
                        id='funnel-name'
                        labelText={copy.editor.name}
                        placeholder={copy.editor.namePlaceholder}
                        maxLength={80}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Dropdown
                        id='funnel-window'
                        titleText={copy.editor.window}
                        label={copy.editor.window}
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
                        {drafts.length >= MAX_STEPS ? copy.editor.maxSteps(MAX_STEPS) : copy.editor.addStep}
                    </Button>
                </div>
                {error ? <InlineNotification kind='error' lowContrast hideCloseButton title={error} /> : null}
            </div>
        </Modal>,
        document.body
    );
};

export default FunnelEditor;
