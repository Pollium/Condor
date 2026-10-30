import { Button } from '@carbon/react';
import { Group, Row } from '@/modules/projects/components/SettingsRows';
import { projectsApi } from '@/modules/projects/api/api';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { errorCopy } from '@/shared/utils/error-copy';
import { fmt } from '@/shared/utils/format';
import { useQuery } from '@condor/ui/hooks/api/use-query';

const StatusGroup = () => {
    const project = useProject();
    const status = useQuery(projectsApi.status, [project.id]);
    const data = status.data;
    const label = data === null ? copy.status.checking : data.lastEventAt === null ? copy.status.noEvents : copy.status.lastEvent(fmt.ago(data.lastEventAt));
    const detail = data === null
        ? null
        : copy.status.today([copy.status.events(data.eventsToday), copy.status.sessions(data.sessionsToday), copy.status.replays(data.replaysToday)].join(' · '));

    return (
        <Group title={copy.status.title} error={errorCopy()(status.error)} note={copy.status.dayStarts(project.settings.timezone)}>
            <Row label={label} detail={detail}>
                <Button kind='ghost' size='sm' disabled={status.loading} onClick={status.reload} className='-mr-4'>
                    {status.loading ? copy.status.checking : copy.status.check}
                </Button>
            </Row>
        </Group>
    );
};

export default StatusGroup;
