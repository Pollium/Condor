import { Button, IconButton, TextInput } from '@carbon/react';
import { Close } from '@carbon/icons-react';
import { Group } from '@/modules/projects/components/SettingsRows';
import { useSaveProject } from '@/modules/projects/hooks/use-save-project';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { useState, type FormEvent } from 'react';

const RouteGroups = ({ disabled }: { disabled: boolean }) => {
    const { settings: current } = useProject();
    const { status, error, settings } = useSaveProject();
    const [draft, setDraft] = useState('');
    const pattern = draft.trim();
    const invalid = pattern !== '' && !pattern.startsWith('/');
    const groups = current.routeGroups;

    const add = async (event: FormEvent) => {
        event.preventDefault();
        if(pattern === '' || invalid) return;
        if(groups.includes(pattern)){
            setDraft('');
            return;
        }
        if(await settings({ routeGroups: [...groups, pattern] })) setDraft('');
    };

    return (
        <Group
            title={copy.routes.title}
            status={status}
            error={error}
            note={<><span className='font-mono'>{copy.routes.param}</span>{copy.routes.paramNote}<span className='font-mono'>*</span>{copy.routes.restNote}</>}
        >
            {groups.length ? (
                <ul className='flex flex-col'>
                    {groups.map((group) => (
                        <li key={group} className='flex min-h-10 items-center justify-between gap-4 border-b border-separator'>
                            <span className='truncate font-mono text-[0.8125rem] text-foreground'>{group}</span>
                            {disabled ? null : (
                                <IconButton kind='ghost' size='sm' label={copy.routes.remove(group)} align='left' onClick={() => settings({ routeGroups: groups.filter((entry) => entry !== group) })}>
                                    <Close />
                                </IconButton>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className='py-2 text-[0.875rem] text-label-2'>{copy.routes.empty}</p>
            )}
            {disabled ? null : (
                <form onSubmit={add} className='flex items-end gap-2 pt-3'>
                    <TextInput
                        id='route-group'
                        size='md'
                        labelText={copy.routes.pattern}
                        hideLabel
                        placeholder={copy.routes.placeholder}
                        value={draft}
                        invalid={invalid}
                        invalidText={copy.routes.invalid}
                        onChange={(event) => setDraft(event.target.value)}
                        className='[&_input]:font-mono [&_input]:text-[0.8125rem]'
                    />
                    <Button type='submit' kind='tertiary' size='md' disabled={pattern === '' || invalid || status === 'saving'}>
                        {copy.routes.add}
                    </Button>
                </form>
            )}
        </Group>
    );
};

export default RouteGroups;
