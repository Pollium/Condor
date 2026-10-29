import { ComboBox } from '@carbon/react';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { journeysApi } from '@/modules/journeys/api/api';
import { usePeriodStore } from '@/shared/store/period';
import { translate } from '@/shared/utils/carbon-translate';

interface StartPickerProps{
    projectId: string;
    value: string | null;
    onChange: (start: string | null) => void;
}

const StartPicker = ({ projectId, value, onChange }: StartPickerProps) => {
    const period = usePeriodStore((state) => state.period);
    const pages = useQuery(journeysApi.pages, [projectId, period]);
    const paths = pages.data?.slices.map((slice) => slice.id) ?? [];

    return (
        <ComboBox
            id='journey-start'
            aria-label='Página de inicio'
            size='sm'
            placeholder='Desde cualquier página'
            items={value && !paths.includes(value) ? [value, ...paths] : paths}
            selectedItem={value}
            shouldFilterItem={({ item, inputValue }) => !inputValue || item.toLowerCase().includes(inputValue.toLowerCase())}
            allowCustomValue
            autoAlign
            onChange={({ selectedItem, inputValue }) => onChange(selectedItem ?? (inputValue?.trim() || null))}
            translateWithId={translate}
            className='combo-inline w-60'
        />
    );
};

export default StartPicker;
