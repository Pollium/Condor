import {
    Header,
    HeaderGlobalAction,
    HeaderGlobalBar,
    HeaderMenu,
    HeaderMenuButton,
    HeaderMenuItem,
    HeaderName,
    HeaderNavigation,
    HeaderPanel,
    SkipToContent,
    Switcher,
    SwitcherDivider,
    SwitcherItem,
    Tooltip
} from '@carbon/react';
import { Asleep, Light, Search, UserAvatar } from '@carbon/icons-react';
import { Period } from '@condor/contracts/shared/period';
import { endSession } from '@condor/ui/services/end-session';
import { useThemeStore } from '@condor/ui/store/theme';
import Sidebar from '@/app/layouts/Sidebar';
import { useMe } from '@/modules/auth/hooks/use-me';
import { useLive } from '@/modules/live/hooks/use-live';
import AddApp from '@/modules/projects/components/AddApp';
import ConnectApp from '@/modules/projects/components/ConnectApp';
import WorkspaceProvider from '@/modules/projects/components/WorkspaceProvider';
import { useWorkspace } from '@/modules/projects/hooks/use-workspace';
import Spotlight from '@/modules/search/components/Spotlight';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { usePeriodStore } from '@/shared/store/period';
import { useToolbarStore } from '@/shared/store/toolbar';
import { SETTINGS_VIEW, VIEWS, viewPath } from '@/shared/utils/views';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const PERIODS: { value: Period; label: string }[] = [
    { value: '24h', label: 'Últimas 24 horas' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' }
];

const switchProject = (pathname: string, from: string, to: string): string => {
    const view = pathname.split('/')[2] ?? '';
    return pathname.startsWith(`/${from}`) ? viewPath(to, view) : `/${to}`;
};

const Shell = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { projects, project, setAdding } = useWorkspace();
    const me = useMe();
    const theme = useThemeStore((state) => state.theme);
    const setTheme = useThemeStore((state) => state.set);
    const period = usePeriodStore((state) => state.period);
    const setPeriod = usePeriodStore((state) => state.setPeriod);
    const setToolbar = useToolbarStore((state) => state.setToolbar);
    const live = useLive(project?.id ?? null);
    const [nav, setNav] = useState(false);
    const [account, setAccount] = useState(false);
    const [spotlight, setSpotlight] = useState(false);
    const connecting = project !== null && project.lastEventAt === null && pathname !== viewPath(project.id, SETTINGS_VIEW.segment);

    useEffect(() => {
        document.getElementById('scroller')?.scrollTo({ top: 0 });
    }, [pathname]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'){
                event.preventDefault();
                setSpotlight(true);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const go = (to: string) => {
        setAccount(false);
        navigate(to);
    };

    return (
        <div className='h-dvh bg-canvas text-foreground'>
            <Header aria-label='Condor'>
                <SkipToContent href='#main-content'>Ir al contenido</SkipToContent>
                <HeaderMenuButton aria-label={nav ? 'Cerrar el menú' : 'Abrir el menú'} isActive={nav} onClick={() => setNav((value) => !value)} isCollapsible />
                <HeaderName as={Link} to='/' prefix=''>
                    Condor
                </HeaderName>
                <HeaderNavigation aria-label='App'>
                    <HeaderMenu aria-label='Cambiar de app' menuLinkName={project?.name ?? 'Elige una app'}>
                        {projects.map((entry) => (
                            <HeaderMenuItem key={entry.id} isActive={entry.id === project?.id} onClick={() => navigate(project === null ? `/${entry.id}` : switchProject(pathname, project.id, entry.id))}>
                                {entry.name}
                            </HeaderMenuItem>
                        ))}
                        <HeaderMenuItem onClick={() => setAdding(true)}>Añadir una app…</HeaderMenuItem>
                    </HeaderMenu>
                </HeaderNavigation>
                <HeaderGlobalBar>
                    {project !== null && project.lastEventAt !== null ? (
                        <div className='hidden items-center gap-4 pr-2 md:flex'>
                            <Tooltip label={`${live?.count ?? 0} personas en ${project.name} ahora`} align='bottom'>
                                <button type='button' onClick={() => navigate(viewPath(project.id, 'sesiones'))} className='flex items-center gap-2 text-[0.875rem] tabular-nums text-foreground'>
                                    <span className={`size-2 rounded-full ${(live?.count ?? 0) > 0 ? 'bg-success' : 'bg-label-3'}`} />
                                    {live?.count ?? 0} en vivo
                                </button>
                            </Tooltip>
                            <ToolbarMenu label='Periodo' choices={PERIODS} value={period} onChange={setPeriod} />
                        </div>
                    ) : null}
                    <HeaderGlobalAction aria-label='Buscar' tooltipAlignment='end' onClick={() => setSpotlight(true)}>
                        <Search size={20} />
                    </HeaderGlobalAction>
                    <HeaderGlobalAction aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'} tooltipAlignment='end' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? <Light size={20} /> : <Asleep size={20} />}
                    </HeaderGlobalAction>
                    <HeaderGlobalAction aria-label='Tu cuenta' tooltipAlignment='end' isActive={account} onClick={() => setAccount((value) => !value)}>
                        <UserAvatar size={20} />
                    </HeaderGlobalAction>
                </HeaderGlobalBar>
                <HeaderPanel expanded={account} onHeaderPanelFocus={() => setAccount(false)}>
                    <Switcher aria-label='Cuenta'>
                        {me.data ? <li className='px-4 pb-3 pt-4 text-[0.75rem] text-label-2'>{me.data.name} · {me.data.email}</li> : null}
                        <SwitcherItem aria-label='Tu cuenta' onClick={() => go('/cuenta')}>Tu cuenta</SwitcherItem>
                        <SwitcherItem aria-label='Equipo' onClick={() => go('/equipo')}>Equipo</SwitcherItem>
                        {project !== null ? (
                            <SwitcherItem aria-label='Ajustes de la app' onClick={() => go(viewPath(project.id, SETTINGS_VIEW.segment))}>Ajustes de la app</SwitcherItem>
                        ) : null}
                        <SwitcherItem aria-label='Añadir una app' onClick={() => { setAccount(false); setAdding(true); }}>Añadir una app…</SwitcherItem>
                        <SwitcherDivider />
                        <SwitcherItem aria-label='Cerrar sesión' onClick={() => { setAccount(false); void endSession(); }}>Cerrar sesión</SwitcherItem>
                    </Switcher>
                </HeaderPanel>
                <Sidebar projectId={project?.id ?? null} expanded={nav} onNavigate={() => setNav(false)} />
            </Header>

            <div id='scroller' className={`fixed inset-x-0 bottom-0 top-12 overflow-y-auto ${project === null ? '' : 'lg:left-64'}`}>
                <div ref={setToolbar} className='sticky top-0 z-10 flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 border-b border-separator bg-canvas px-4 py-3 lg:px-8' />
                <main id='main-content' key={`${pathname}`} className='mx-auto w-full max-w-[1640px] px-4 pb-10 pt-6 lg:px-8'>
                    {connecting ? <ConnectApp /> : <Outlet />}
                </main>
            </div>

            <AddApp />
            <Spotlight isOpen={spotlight} onOpenChange={setSpotlight} views={[...VIEWS, SETTINGS_VIEW]} />
        </div>
    );
};

const ConsoleLayout = () => (
    <WorkspaceProvider>
        <Shell />
    </WorkspaceProvider>
);

export default ConsoleLayout;
