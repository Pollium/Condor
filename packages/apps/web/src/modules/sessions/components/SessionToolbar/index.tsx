import { MultiSelect, Search } from '@carbon/react';
import { useEffect, useState } from 'react';
import { copy } from '@/modules/sessions/i18n';
import { DEVICES, FLAGS, narrowFlags, SORTS, type ListState } from '@/modules/sessions/utils/query';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { translate } from '@/shared/utils/carbon-translate';

interface SessionToolbarProps{
    state: ListState;
    total: number | null;
    onChange: (next: Partial<ListState>) => void;
}

const SessionToolbar = ({ state, total, onChange }: SessionToolbarProps) => {
    const [draft, setDraft] = useState(state.search);
    const [synced, setSynced] = useState(state.search);

    if(synced !== state.search){
        setSynced(state.search);
        setDraft(state.search);
    }

    useEffect(() => {
        if(draft === state.search) return;
        const timer = window.setTimeout(() => onChange({ search: draft, page: 1 }), 300);
        return () => window.clearTimeout(timer);
    }, [draft, state.search, onChange]);

    return (
        <>
            {total !== null ? <p className='shrink-0 text-[0.8125rem] tabular-nums text-label-2'>{copy.toolbar.total(total)}</p> : null}
            <Search
                size='sm'
                labelText={copy.toolbar.searchLabel}
                placeholder={copy.toolbar.searchPlaceholder}
                closeButtonLabelText={copy.toolbar.clearSearch}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className='w-full sm:w-64'
            />
            <ToolbarMenu label={copy.toolbar.sort} choices={SORTS} value={state.sort} onChange={(sort) => onChange({ sort, page: 1 })} />
            <ToolbarMenu label={copy.toolbar.device} choices={DEVICES} value={state.device ?? 'all'} onChange={(device) => onChange({ device: device === 'all' ? null : device, page: 1 })} />
            <MultiSelect
                translateWithId={translate}
                id='session-filters'
                type='inline'
                size='sm'
                titleText={copy.toolbar.filters}
                hideLabel
                label={copy.toolbar.filters}
                items={FLAGS}
                itemToString={(flag) => flag?.label ?? ''}
                selectedItems={FLAGS.filter((flag) => state.flags.includes(flag.id))}
                sortItems={(items) => [...items]}
                onChange={({ selectedItems }) => onChange({ flags: narrowFlags((selectedItems ?? []).map((flag) => flag.id), state.flags), page: 1 })}
                className='[&_[role=listbox]]:min-w-72'
            />
        </>
    );
};

export default SessionToolbar;
