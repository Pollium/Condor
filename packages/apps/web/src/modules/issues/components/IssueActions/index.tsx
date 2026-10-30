import { IssueDetail, IssueStatus } from '@condor/contracts/issues/domain';
import { Button, OverflowMenuItem } from '@carbon/react';
import { Play } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import { copy } from '@/modules/issues/i18n';
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
                    {copy.actions.viewSession}
                </Button>
            ) : null}
            {editable ? (
                <ActionMenu subject={issue.message} ariaLabel={copy.actions.more}>
                    {open ? <OverflowMenuItem itemText={copy.actions.resolve} disabled={busy} onClick={() => onStatus('resolved')} /> : null}
                    {open ? <OverflowMenuItem itemText={copy.actions.ignore} disabled={busy} onClick={() => onStatus('ignored')} /> : null}
                    {open ? null : <OverflowMenuItem itemText={copy.actions.reopen} disabled={busy} onClick={() => onStatus('open')} />}
                </ActionMenu>
            ) : null}
        </div>
    );
};

export default IssueActions;
