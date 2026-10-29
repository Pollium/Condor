import { TextInput } from '@carbon/react';
import { useState } from 'react';

interface BlurInputProps{
    id: string;
    label: string;
    value: string;
    disabled: boolean;
    placeholder?: string;
    helper?: string;
    mono?: boolean;
    required?: boolean;
    onSave: (value: string) => void;
}

const BlurInput = ({ id, label, value, disabled, placeholder, helper, mono = false, required = false, onSave }: BlurInputProps) => {
    const [draft, setDraft] = useState(value);
    const [synced, setSynced] = useState(value);
    if(synced !== value){
        setSynced(value);
        setDraft(value);
    }

    const commit = () => {
        const next = draft.trim();
        if(next === value) return;
        if(required && next === ''){
            setDraft(value);
            return;
        }
        onSave(next);
    };

    return (
        <TextInput
            id={id}
            size='md'
            labelText={label}
            helperText={helper}
            placeholder={placeholder}
            value={draft}
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
            className={`pt-2 ${mono ? '[&_input]:font-mono [&_input]:text-[0.8125rem]' : ''}`}
        />
    );
};

export default BlurInput;
