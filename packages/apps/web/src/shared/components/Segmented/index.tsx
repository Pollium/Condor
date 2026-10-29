import { ContentSwitcher, Switch } from '@carbon/react';

export interface Choice<T extends string>{
    value: T;
    label: string;
}

interface SegmentedProps<T extends string>{
    label: string;
    choices: Choice<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

const Segmented = <T extends string>({ label, choices, value, onChange, className = '' }: SegmentedProps<T>) => (
    <ContentSwitcher
        aria-label={label}
        size='sm'
        selectedIndex={Math.max(
            0,
            choices.findIndex((choice) => choice.value === value)
        )}
        onChange={({ name }) => name !== undefined && onChange(String(name) as T)}
        className={`segmented-fit w-auto shrink-0 ${className}`}
    >
        {choices.map((choice) => (
            <Switch key={choice.value} name={choice.value} text={choice.label} className='whitespace-nowrap px-4' />
        ))}
    </ContentSwitcher>
);

export default Segmented;
