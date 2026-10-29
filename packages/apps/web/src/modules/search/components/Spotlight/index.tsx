import { ContainedList, ContainedListItem, InlineLoading, Modal, Search } from '@carbon/react';
import { Debug, Document, Screen } from '@carbon/icons-react';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { View, viewPath } from '@/shared/utils/views';
import ProjectMark from '@/modules/projects/components/ProjectMark';
import { useWorkspace } from '@/modules/projects/hooks/use-workspace';
import { searchApi } from '@/modules/search/api/api';
import { useDebounced } from '@/shared/hooks/use-debounced';
import { fmt } from '@/shared/utils/format';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

interface SpotlightProps{
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    views: View[];
}

const Spotlight = ({ isOpen, onOpenChange, views }: SpotlightProps) => {
    const navigate = useNavigate();
    const { projects, project } = useWorkspace();
    const [query, setQuery] = useState('');
    const q = useDebounced(query.trim(), 200);
    const lower = q.toLowerCase();
    const results = useQuery(searchApi.search, [project?.id, q === '' ? undefined : q]);

    const close = () => {
        setQuery('');
        onOpenChange(false);
    };

    const go = (to: string) => {
        navigate(to);
        close();
    };

    const matches = (text: string) => lower === '' || text.toLowerCase().includes(lower);
    const found = {
        views: project === null ? [] : views.filter((view) => matches(view.label)),
        apps: projects.filter((app) => matches(app.name) || matches(app.host)),
        people: results.data?.people ?? [],
        issues: results.data?.issues ?? [],
        pages: results.data?.pages ?? []
    };
    const empty = Object.values(found).every((list) => list.length === 0) && !results.loading;

    return createPortal(
        <Modal open={isOpen} onRequestClose={close} passiveModal size='sm' modalHeading='Buscar' closeButtonLabel='Cerrar'>
            <div className='flex flex-col gap-6'>
                <Search size='lg' labelText='Buscar en Condor' placeholder='Personas, errores, páginas, apps o vistas' value={query} onChange={(event) => setQuery(event.target.value)} autoFocus closeButtonLabelText='Borrar' />
                {results.loading && q !== '' ? <InlineLoading description='Buscando…' /> : null}
                {empty && q !== '' ? <p className='py-6 text-[0.875rem] text-label-2'>Nada coincide con «{q}».</p> : null}
                {project !== null && found.people.length > 0 ? (
                    <ContainedList label='Personas' kind='on-page' size='sm'>
                        {found.people.map((person) => (
                            <ContainedListItem key={person.personId} renderIcon={Screen} onClick={() => go(person.sessionId === null ? viewPath(project.id, 'sesiones') : `${viewPath(project.id, 'sesiones')}/${person.sessionId}`)}>
                                <span className='flex items-center gap-3'>
                                    <span className='flex-1 truncate'>{person.name ?? person.email ?? person.userId ?? 'Anónimo'}</span>
                                    <span className='truncate text-[0.75rem] text-label-2'>
                                        {[person.city, person.os, `${fmt.n(person.sessions)} ${person.sessions === 1 ? 'sesión' : 'sesiones'}`].filter(Boolean).join(' · ')}
                                    </span>
                                </span>
                            </ContainedListItem>
                        ))}
                    </ContainedList>
                ) : null}
                {project !== null && found.issues.length > 0 ? (
                    <ContainedList label='Errores' kind='on-page' size='sm'>
                        {found.issues.map((issue) => (
                            <ContainedListItem key={issue.issueId} renderIcon={Debug} onClick={() => go(`${viewPath(project.id, 'errores')}?issue=${issue.issueId}`)}>
                                <span className='truncate'>{issue.errorType}: {issue.message}</span>
                            </ContainedListItem>
                        ))}
                    </ContainedList>
                ) : null}
                {project !== null && found.pages.length > 0 ? (
                    <ContainedList label='Páginas' kind='on-page' size='sm'>
                        {found.pages.map((page) => (
                            <ContainedListItem key={page.path} renderIcon={Document} onClick={() => go(`${viewPath(project.id, 'mapas-de-calor')}?path=${encodeURIComponent(page.path)}`)}>
                                <span className='flex items-center gap-3'>
                                    <span className='flex-1 truncate font-mono text-[0.8125rem]'>{page.path}</span>
                                    <span className='text-[0.75rem] tabular-nums text-label-2'>{fmt.n(page.views)} vistas</span>
                                </span>
                            </ContainedListItem>
                        ))}
                    </ContainedList>
                ) : null}
                {found.apps.length > 0 ? (
                    <ContainedList label='Apps' kind='on-page' size='sm'>
                        {found.apps.map((app) => (
                            <ContainedListItem key={app.id} onClick={() => go(`/${app.id}`)}>
                                <span className='flex items-center gap-3'>
                                    <ProjectMark project={app} size={18} />
                                    <span className='flex-1 truncate'>{app.name}</span>
                                    <span className='text-[0.75rem] text-label-2'>{app.host}</span>
                                </span>
                            </ContainedListItem>
                        ))}
                    </ContainedList>
                ) : null}
                {project !== null && found.views.length > 0 ? (
                    <ContainedList label='Ir a' kind='on-page' size='sm'>
                        {found.views.map((view) => (
                            <ContainedListItem key={view.segment} renderIcon={view.icon} onClick={() => go(viewPath(project.id, view.segment))}>
                                {view.label}
                            </ContainedListItem>
                        ))}
                    </ContainedList>
                ) : null}
            </div>
        </Modal>,
        document.body
    );
};

export default Spotlight;
