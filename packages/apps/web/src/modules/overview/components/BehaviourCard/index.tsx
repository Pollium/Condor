import { SkeletonText } from '@carbon/react';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { overviewApi } from '@/modules/overview/api/api';
import Loaded from '@/modules/overview/components/Loaded';
import RangeBars from '@/modules/overview/components/RangeBars';
import Stats from '@/modules/overview/components/Stats';
import Tabbed from '@/modules/overview/components/Tabbed';
import WeekRhythm from '@/modules/overview/components/WeekRhythm';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { oneDecimal } from '@/modules/overview/utils/kpis';
import { fmt } from '@/shared/utils/format';

const BehaviourCard = () => {
    const { projectId, period } = useScope();
    const engagement = useQuery(overviewApi.engagement, [projectId, period]);

    return (
        <Tabbed
            title='Comportamiento'
            lead={
                <Loaded query={engagement} skeleton={<SkeletonText heading width='100%' />}>
                    {(data) => (
                        <Stats
                            items={[
                                { label: 'Tiempo activo', value: fmt.duration(data.activeSeconds) },
                                { label: 'Scroll medio', value: fmt.pct(data.scrollDepth) },
                                { label: 'Clics por sesión', value: oneDecimal(data.clicksPerSession) },
                                { label: 'Sesiones por persona', value: oneDecimal(data.sessionsPerPerson) }
                            ]}
                        />
                    )}
                </Loaded>
            }
            tabs={[
                { id: 'duration', label: 'Duración', content: <RangeBars dimension='duration' /> },
                { id: 'depth', label: 'Páginas', content: <RangeBars dimension='depth' /> },
                { id: 'hours', label: 'Horario', content: <WeekRhythm /> }
            ]}
        />
    );
};

export default BehaviourCard;
