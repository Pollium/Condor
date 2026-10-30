import { InlineLoading, Toggle } from '@carbon/react';
import type { SaveStatus } from '@/modules/projects/hooks/use-save-project';
import { copy } from '@/modules/projects/i18n';
import { useId, type ReactNode } from 'react';

const SAVE_COPY: Record<Exclude<SaveStatus, 'idle'>, { status: 'active' | 'finished' | 'error'; text: string }> = {
    saving: { status: 'active', text: copy.save.saving },
    saved: { status: 'finished', text: copy.save.saved },
    error: { status: 'error', text: copy.save.failed }
};

interface GroupProps{
    title: string;
    note?: ReactNode;
    status?: SaveStatus;
    error?: string | null;
    children: ReactNode;
}

export const Group = ({ title, note, status = 'idle', error, children }: GroupProps) => (
    <section className='flex flex-col'>
        <div className='flex min-h-8 items-center justify-between gap-4 pb-2'>
            <h2 className='text-[1rem] font-normal text-foreground'>{title}</h2>
            {status === 'idle' ? null : <InlineLoading status={SAVE_COPY[status].status} description={SAVE_COPY[status].text} className='w-auto' />}
        </div>
        {children}
        {error ? <p className='pt-2 text-[0.75rem] leading-relaxed text-danger'>{error}</p> : null}
        {note ? <p className='pt-2 text-[0.75rem] leading-relaxed text-label-2'>{note}</p> : null}
    </section>
);

interface RowProps{
    label: string;
    detail?: ReactNode;
    children?: ReactNode;
}

export const Row = ({ label, detail, children }: RowProps) => (
    <div className='flex min-h-11 items-center justify-between gap-6 py-1'>
        <div className='min-w-0'>
            <p className='text-[0.875rem] text-foreground'>{label}</p>
            {detail ? <div className='break-words text-[0.8125rem] text-label-2'>{detail}</div> : null}
        </div>
        {children ? <div className='flex shrink-0 items-center gap-3'>{children}</div> : null}
    </div>
);

interface SwitchRowProps{
    label: string;
    toggled: boolean;
    disabled: boolean;
    onToggle: (value: boolean) => void;
}

export const SwitchRow = ({ label, toggled, disabled, onToggle }: SwitchRowProps) => {
    const id = useId();
    return (
        <div className='flex min-h-11 w-full items-center justify-between gap-6'>
            <label id={`${id}-label`} htmlFor={id} className={`text-[0.875rem] ${disabled ? 'text-label-2' : 'cursor-pointer text-foreground'}`}>
                {label}
            </label>
            <Toggle id={id} aria-labelledby={`${id}-label`} size='sm' hideLabel toggled={toggled} disabled={disabled} onToggle={onToggle} className='shrink-0' />
        </div>
    );
};
