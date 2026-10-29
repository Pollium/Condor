import { Dropdown } from '@carbon/react';
import type { Choice } from '@/shared/components/Segmented';
import { translate } from '@/shared/utils/carbon-translate';

interface ToolbarMenuProps<T extends string>{
    label: string;
    choices: Choice<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

const ToolbarMenu = <T extends string>({ label, choices, value, onChange, className = '' }: ToolbarMenuProps<T>) => (
    <Dropdown
        id={`menu-${label.toLowerCase().replace(/\s+/g, '-')}`}
        type='inline'
        size='sm'
        titleText={label}
        hideLabel
        label={label}
        items={choices}
        itemToString={(choice) => choice?.label ?? ''}
        selectedItem={choices.find((choice) => choice.value === value) ?? null}
        onChange={({ selectedItem }) => selectedItem && onChange(selectedItem.value)}
        translateWithId={translate}
        className={className}
    />
);

export default ToolbarMenu;
