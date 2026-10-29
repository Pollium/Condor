import { IssueDetail, IssueStatus } from '@condor/contracts/issues/domain';
import { Button, OverflowMenuItem } from '@carbon/react';
import { Play } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import ActionMenu from '@/shared/components/ActionMenu';
import { viewPath } from '@/shared/utils/views';

interface IssueActionsProps{
    issue: IssueDetail;
    editable: boolean;
    busy: boolean;
    onStatus: (status: IssueStatus) => void;
}

const IssueActions = ({ issue, editable, busy, onStatus }: IssueActionsProps) => {
    const navigate = useNavigate();
    const session = issue.recentSessions[0];
    const open = issue.status === 'open';

    return (
        <div className='flex shrink-0 items-center gap-1'>
            {session ? (
                <Button kind='ghost' size='md' renderIcon={Play} onClick={() => navigate(viewPath(issue.projectId, `sesiones/${session}`))}>
                    Ver una sesión
                </Button>
            ) : null}
            {editable ? (
                <ActionMenu subject={issue.message} ariaLabel='Más acciones'>
                    {open ? <OverflowMenuItem itemText='Resolver' disabled={busy} onClick={() => onStatus('resolved')} /> : null}
                    {open ? <OverflowMenuItem itemText='Ignorar' disabled={busy} onClick={() => onStatus('ignored')} /> : null}
                    {open ? null : <OverflowMenuItem itemText='Reabrir' disabled={busy} onClick={() => onStatus('open')} />}
                </ActionMenu>
            ) : null}
        </div>
    );
};

export default IssueActions;
