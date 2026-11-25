import { Button } from '@carbon/react';
import { projectRoutes } from '@condor/contracts/projects/routes';
import { describeError } from '@pollium/readable-react/errors/copy';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { Group, Row } from '@/modules/projects/components/SettingsRows';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { fmt } from '@/shared/utils/format';

const StatusGroup = () => {
    const project = useProject();
    const status = useQuery(projectRoutes.status, { path: { projectId: project.id } });
    const data = status.data;
    const label = data === null ? copy.status.checking : data.lastEventAt === null ? copy.status.noEvents : copy.status.lastEvent(fmt.ago(data.lastEventAt));
    const detail = data === null
        ? null
        : copy.status.today([copy.status.events(data.eventsToday), copy.status.sessions(data.sessionsToday), copy.status.replays(data.replaysToday)].join(' · '));

    return (
        <Group title={copy.status.title} error={describeError(status.error)} note={copy.status.dayStarts(project.settings.timezone)}>
            <Row label={label} detail={detail}>
                <Button kind='ghost' size='sm' disabled={status.loading} onClick={status.reload} className='-mr-4'>
                    {status.loading ? copy.status.checking : copy.status.check}
                </Button>
            </Row>
        </Group>
    );
};

export default StatusGroup;
