import { ComboBox } from '@carbon/react';
import { overviewRoutes } from '@condor/contracts/overview/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { copy } from '@/modules/journeys/i18n';
import { usePeriodStore } from '@/shared/store/period';
import { translate } from '@/shared/utils/carbon-translate';

interface StartPickerProps{
    projectId: string;
    value: string | null;
    onChange: (start: string | null) => void;
}

const StartPicker = ({ projectId, value, onChange }: StartPickerProps) => {
    const period = usePeriodStore((state) => state.period);
    const pages = useQuery(overviewRoutes.breakdown, { path: { projectId }, query: { dimension: 'page', period, limit: 100 } });
    const paths = pages.data?.slices.map((slice) => slice.id) ?? [];

    return (
        <ComboBox
            id='journey-start'
            aria-label={copy.startPicker.label}
            size='sm'
            placeholder={copy.startPicker.placeholder}
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
