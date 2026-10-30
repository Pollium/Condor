import { SideNav, SideNavDivider, SideNavItems, SideNavLink } from '@carbon/react';
import { copy } from '@/app/i18n';
import { useIssueCount } from '@/modules/issues/hooks/use-issue-count';
import { SETTINGS_VIEW, VIEWS, viewPath } from '@/shared/utils/views';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps{
    projectId: string | null;
    expanded: boolean;
    onNavigate: () => void;
}

const isCurrent = (pathname: string, to: string, exact: boolean): boolean =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

const Sidebar = ({ projectId, expanded, onNavigate }: SidebarProps) => {
    const { pathname } = useLocation();
    const openIssues = useIssueCount(projectId);
    if(projectId === null) return null;

    return (
        <SideNav aria-label={copy.navigation} expanded={expanded} onOverlayClick={onNavigate} isRail={false}>
            <SideNavItems>
                {VIEWS.map((view) => {
                    const to = viewPath(projectId, view.segment);
                    const count = view.segment === 'errores' ? openIssues : 0;
                    return (
                        <SideNavLink key={view.segment} as={Link} to={to} renderIcon={view.icon} isActive={isCurrent(pathname, to, view.segment === '')} onClick={onNavigate} className='nav-count'>
                            <span className='flex w-full items-center justify-between gap-2'>
                                {view.label}
                                {count > 0 ? <span className='tabular-nums text-label-2'>{count}</span> : null}
                            </span>
                        </SideNavLink>
                    );
                })}
                <SideNavDivider />
                <SideNavLink as={Link} to={viewPath(projectId, SETTINGS_VIEW.segment)} renderIcon={SETTINGS_VIEW.icon} isActive={pathname === viewPath(projectId, SETTINGS_VIEW.segment)} onClick={onNavigate}>
                    {copy.settings}
                </SideNavLink>
            </SideNavItems>
        </SideNav>
    );
};

export default Sidebar;
