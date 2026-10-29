import { Button } from '@carbon/react';
import { Group, Row } from '@/modules/projects/components/SettingsRows';
import { projectsApi } from '@/modules/projects/api/api';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { errorCopy } from '@/shared/utils/error-copy';
import { fmt } from '@/shared/utils/format';
import { useQuery } from '@condor/ui/hooks/api/use-query';

const StatusGroup = () => {
    const project = useProject();
    const status = useQuery(projectsApi.status, [project.id]);
    const data = status.data;
    const label = data === null ? 'Comprobando…' : data.lastEventAt === null ? 'Aún no llega ningún evento' : `Último evento ${fmt.ago(data.lastEventAt)}`;
    const detail = data === null
        ? null
        : `Hoy: ${fmt.n(data.eventsToday)} eventos · ${fmt.n(data.sessionsToday)} sesiones · ${fmt.n(data.replaysToday)} grabaciones`;

    return (
        <Group title='Estado' error={errorCopy()(status.error)} note={`El día empieza a medianoche en ${project.settings.timezone}.`}>
            <Row label={label} detail={detail}>
                <Button kind='ghost' size='sm' disabled={status.loading} onClick={status.reload} className='-mr-4'>
                    {status.loading ? 'Comprobando…' : 'Comprobar'}
                </Button>
            </Row>
        </Group>
    );
};

export default StatusGroup;
