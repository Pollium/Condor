import { MultiSelect, Search } from '@carbon/react';
import { useEffect, useState } from 'react';
import { DEVICES, FLAGS, narrowFlags, SORTS, type ListState } from '@/modules/sessions/utils/query';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { translate } from '@/shared/utils/carbon-translate';
import { fmt } from '@/shared/utils/format';

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
            {total !== null ? <p className='shrink-0 text-[0.8125rem] tabular-nums text-label-2'>{fmt.n(total)} {total === 1 ? 'sesión' : 'sesiones'}</p> : null}
            <Search
                size='sm'
                labelText='Buscar sesiones'
                placeholder='Persona, correo o página'
                closeButtonLabelText='Borrar'
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className='w-full sm:w-64'
            />
            <ToolbarMenu label='Ordenar' choices={SORTS} value={state.sort} onChange={(sort) => onChange({ sort, page: 1 })} />
            <ToolbarMenu label='Dispositivo' choices={DEVICES} value={state.device ?? 'all'} onChange={(device) => onChange({ device: device === 'all' ? null : device, page: 1 })} />
            <MultiSelect
                translateWithId={translate}
                id='session-filters'
                type='inline'
                size='sm'
                titleText='Filtros'
                hideLabel
                label='Filtros'
                items={FLAGS}
                itemToString={(flag) => flag?.label ?? ''}
                selectedItems={FLAGS.filter((flag) => state.flags.includes(flag.id))}
                sortItems={(items) => [...items]}
                onChange={({ selectedItems }) => onChange({ flags: narrowFlags((selectedItems ?? []).map((flag) => flag.id), state.flags), page: 1 })}
            />
        </>
    );
};

export default SessionToolbar;
